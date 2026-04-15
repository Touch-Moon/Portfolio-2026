# Sanity 개선 작업 — CLI 실행 가이드

## 변경 요약

### 스키마
- **`workCategory.ts`** (신규) — Work 전용 카테고리
- **`storyCategory.ts`** (신규) — Story 전용 카테고리
- **`work.ts`** 수정
  - ❌ `externalUrl` 제거
  - ✅ `siteUrl`, `githubUrl` 추가 (싱글페이지 버튼용)
  - ✅ `tags` (string array) 추가
  - 🔁 `categories` reference 타입: `category` → `workCategory`
- **`story.ts`** 수정
  - ✅ `categories` (array of `storyCategory` refs) 추가 (복수 선택)
  - ✅ `githubUrl`, `stackblitzUrl` 추가
  - ✅ `tags` 추가
  - 기존 `category` (string) 필드는 `hidden: true`로 남겨둠 (마이그레이션 후 안전하게 제거 가능)
- **`index.ts`** — 신규 카테고리 등록, 기존 `category` 타입은 legacy로 보존

### 스크립트
- `scripts/seed-categories.mjs` — 초기 카테고리 일괄 생성
- `scripts/migrate-work-links.mjs` — Work에 siteUrl/githubUrl 매핑
- `scripts/migrate-story-categories.mjs` — Story의 legacy 문자열 카테고리를 새 references로 변환

### 초기 카테고리 목록

**Work**: Branding · Web Design · Web Development · UI/UX · Mobile App · Print/Graphic
**Story**: Code Snippet · Animation / Interaction · Tutorial · Case Study Note · Tooling / Workflow · Thoughts

---

## CLI 실행 순서

프로젝트 루트(`my-portfolio-sanity/`)에서:

### 1) 스키마 반영 확인

```bash
npx sanity dev
```

Studio 열어서 Work/Story 문서에 새 필드(siteUrl, githubUrl, categories, tags 등) 보이는지 확인.

### 2) 카테고리 seed

```bash
npx sanity exec scripts/seed-categories.mjs --with-user-token
```

Studio에서 "Work Category" / "Story Category" 문서가 각각 6개씩 생성됐는지 확인.

### 3) Work 링크 수집 → 매핑

**GitHub repo 목록 가져오기:**
```bash
gh repo list buytouch --limit 100 --json name,url,description
# 또는 본인 계정: gh repo list --limit 100 --json name,url
```

**Vercel deployment 목록:**
```bash
vercel ls
# 또는 프로젝트 리스트: vercel projects ls
```

Work slug 목록 먼저 확인:
```bash
npx sanity exec -e <(echo '
  import { getCliClient } from "sanity/cli";
  const c = getCliClient({ apiVersion: "2025-01-01" });
  const rows = await c.fetch(`*[_type=="work"]|order(title asc){title,"slug":slug.current}`);
  console.table(rows);
') --with-user-token
```

`scripts/migrate-work-links.mjs` 상단의 `LINKS` 객체에 slug → { siteUrl, githubUrl } 채우기.

**미리보기:**
```bash
DRY_RUN=1 npx sanity exec scripts/migrate-work-links.mjs --with-user-token
```

**실제 적용:**
```bash
npx sanity exec scripts/migrate-work-links.mjs --with-user-token
```

> 기존 `externalUrl` 필드는 이 스크립트가 자동으로 unset 합니다.

### 4) Story 카테고리 마이그레이션

```bash
DRY_RUN=1 npx sanity exec scripts/migrate-story-categories.mjs --with-user-token
```

매핑 결과 확인 후:
```bash
npx sanity exec scripts/migrate-story-categories.mjs --with-user-token
```

원하는 조정이 있으면 스크립트 상단 `OVERRIDES` 에 slug별로 직접 지정.

### 5) Work 기존 `categories` 참조

기존 work 문서의 `categories`는 구 `category` 타입을 참조하고 있어 신규 `workCategory`로 전환 필요. 개수가 적으니 **Studio에서 수동 재선택 추천**. 스키마상 필수가 아니라 비워두고 나중에 채워도 됩니다.

### 6) 프론트엔드 연동 (포트폴리오 사이트)

GROQ 쿼리 업데이트 필요 — `externalUrl` 제거, 새 필드 추가:

```groq
*[_type == "work" && slug.current == $slug][0]{
  ...,
  siteUrl,
  githubUrl,
  tags,
  categories[]->{_id, title, "slug": slug.current}
}

*[_type == "story" && slug.current == $slug][0]{
  ...,
  githubUrl,
  stackblitzUrl,
  tags,
  categories[]->{_id, title, "slug": slug.current}
}
```

Work/Story 싱글페이지 컴포넌트에 조건부 버튼 렌더링:

```tsx
{work.siteUrl && <a href={work.siteUrl} target="_blank">Visit Site</a>}
{work.githubUrl && <a href={work.githubUrl} target="_blank">GitHub</a>}

{story.githubUrl && <a href={story.githubUrl} target="_blank">GitHub</a>}
{story.stackblitzUrl && <a href={story.stackblitzUrl} target="_blank">StackBlitz</a>}
```

### 7) 배포

```bash
npx sanity deploy
git add -A
git commit -m "feat(sanity): split Work/Story categories, add site/github/stackblitz links, tags"
git push
```

---

## 정리 (마이그레이션 완료 후 — 선택)

확인 후 다음 제거 가능:
- `schemaTypes/category.ts` + `index.ts`에서 등록 해제
- `schemaTypes/story.ts`의 hidden `category` 필드
- `schemaTypes/project.ts`, `caseStudy.ts`, `post.ts`, `page.ts` (미사용 legacy 파일들)
- 구 `category` 도큐먼트들 (Studio에서 Vision tool로 일괄 삭제)

---

## 참고

- `tags`는 일단 스키마에만 추가. 프론트엔드에서 표시할지는 디자인 확정 후 결정.
- StackBlitz는 임베드 대신 **링크 버튼**만. 페이지 성능/모바일 UX 이유.
- 카테고리는 **복수 선택**으로 열어둠. 프론트엔드에서 대표 1개만 노출하고 싶으면 `categories[0]` 사용.
