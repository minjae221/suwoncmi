# 수원선교교회 홈페이지 (Static)

정적 HTML/CSS/JS 기반으로 제작된 교회 홈페이지입니다. GitHub Pages 배포를 기준으로 구성했습니다.

## 로컬 미리보기

```bash
python3 -m http.server
```

브라우저에서 `http://localhost:8000/suwon-mission-church/` 로 접속하세요.

## GitHub Pages 배포

1. 이 폴더를 GitHub 저장소에 push
2. GitHub 저장소 Settings → Pages
3. Branch: `main` / Folder: `/ (root)` 선택 후 Save
4. 배포 URL 접속

## 데이터 수정은 `data/work.json` 하나로

### 1) 사이트 공통 정보 수정
- `site.churchName`, `site.denomination`, `site.address`, `site.tel`
- `site.links.youtube`, `site.links.instagram`, `site.links.instagramHandle`

### 2) 홈 문구/예배시간/오시는길 설정
- 홈 히어로 문구: `hero.headline`, `hero.sub`, `hero.cta`
- 예배시간: `worshipTimes` 배열
- 지도 설정: `location.mapProvider`, `location.naverSearchQuery`, `location.mapUrl`, `location.mapImage`
- `location.mapUrl`을 비워두면 `mapProvider=naver` + `naverSearchQuery`로 자동 URL 생성

### 3) 공지 추가 방법
- `data/work.json` → `notices` 배열에 항목 추가
- 필드: `date`, `title{ko,en}`, `body{ko,en}`, `link(선택)`
- 주간 예배 공지를 자동 제목으로 쓰려면 `autoWeeklyWorshipTitle: true` 추가
- 자동 제목 형식: `N월 N째 주 예배 안내` (해당 주 일요일 날짜 기준)

### 4) 커뮤니티 글/사진 추가 방법
1. 이미지 파일을 `assets/img/community/` 폴더에 넣기
2. `data/work.json` → `community` 배열에 항목 추가
3. `images` 배열에 `src`만 추가하면 자동 표시 (`.png`, `.jpg`, `.jpeg`, `.webp`, `.svg` 모두 가능)

### 5) 섬기는 분 수정 방법
- `assets/img/staff/` 폴더에 사진 추가
- `data/work.json` → `staff` 항목의 `name`, `photo`, `bio` 수정
- `photo`는 `.png`, `.jpg`, `.jpeg`, `.webp`, `.svg` 형식 모두 사용 가능

### 6) 교회소개(about) 문단 수정 방법
- `data/work.json` → `about.sections`의 `paragraphs.ko`, `paragraphs.en` 수정

## 지도 이미지 교체 방법
- 기본 지도 썸네일: `assets/img/location/naver-map.png` (없으면 `.jpg/.jpeg/.webp/.svg` 순으로 자동 탐색)
- placeholder: `assets/img/location/placeholder.svg`
- 방법 1: `assets/img/location/naver-map.(png|jpg|jpeg|webp|svg)` 파일을 직접 교체
- 방법 2: `data/work.json`의 `location.mapImage.src`를 외부 이미지 URL로 변경
- 지도 썸네일은 `.png`, `.jpg`, `.jpeg`, `.webp`, `.svg` 모두 사용 가능
- 지도 썸네일 클릭 시 `location.mapUrl`(또는 `naverSearchQuery` 기반 자동 생성 URL)로 이동

## 로고 넣는 법
- `assets/img/logo.png`(권장) 또는 `assets/img/logo.jpg`, `assets/img/logo.jpeg`, `assets/img/logo.webp`, `assets/img/logo.svg` 파일로 교체하면 헤더에 자동 반영됩니다.

## 적용 확인 리스트
- KR/EN 각 페이지에서 hero-lite 존재 확인
- KR/EN 각 페이지에서 섹션 타이틀 강조선 확인
- KR/EN 각 페이지에서 카드 hover 동작 확인
- KR/EN 각 페이지에서 버튼 hover/active/focus-visible 확인
- KR/EN 각 페이지에서 reveal 애니메이션 동작 확인

## reveal/스타일 적용 가이드
- `section` 또는 `hero`/`hero-lite` 블록에 기본 스타일이 적용됩니다.
- 카드형 UI는 `card` 클래스를 사용하면 hover/이미지 확대가 적용됩니다.
- 섹션 제목 강조선은 `section-title` 안의 `h2`/`h3` 또는 `about-section`의 `h3`에 적용됩니다.
- 필요 시 `reveal` 클래스를 직접 추가하면 스크롤 페이드인이 적용됩니다.

## 설교 페이지
- `sermons.html` / `en/sermons.html` 에서 유튜브 채널로 연결됩니다.

## 체크리스트
- [ ] 상단 언어 전환 KR | EN 링크가 현재 페이지에 맞게 이동됨
- [ ] 헤더/푸터/연락처/예배시간/지도 링크가 `data/work.json`에서 렌더링됨
- [ ] 공지/커뮤니티/섬기는 분/교회소개가 `data/work.json`에서 렌더링됨
- [ ] 홈의 공지 3개, 커뮤니티 2개 미리보기 정상 표시
- [ ] 커뮤니티 페이지/홈에 Instagram 링크 표시 및 동작
- [ ] 모바일에서 레이아웃/버튼/텍스트가 깨지지 않음
- [ ] `location.html`/`en/location.html` 버튼 및 지도 이미지 클릭 시 네이버지도 열림
