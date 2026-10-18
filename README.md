# Sangmin Bae — research homepage

A self-contained, responsive academic homepage with locally hosted Noto Sans fonts and images. No JavaScript framework, external API, analytics, or package installation is required.

## 로컬 미리보기와 배포

대표 주소는 **https://www.raymin0223.com/** 입니다. 기존 GitHub Pages의
`main` 브랜치 `/ (root)` 배포를 유지합니다. 빌드는 `dist/`를 생성한 후
게시할 파일만 저장소 루트로 복사합니다. 루트의 `index.html`, `styles.css`,
`app.js`, `assets/`는 생성 결과이므로 직접 수정하지 마세요.

```bash
python3 build.py
python3 scripts/check_site.py
python3 -m http.server 8000 --bind 127.0.0.1
```

브라우저에서 <http://localhost:8000>을 열면 실제 게시 루트와 기존 파일 URL을
함께 확인할 수 있습니다. 새 사이트만 보려면
`python3 -m http.server 8000 --bind 127.0.0.1 --directory dist`도 가능합니다.
원격 개발 서버에서는 포트 8000을 로컬로 전달한 뒤 같은 주소를 사용하세요.
서버는 `Ctrl+C`로 종료합니다.

원본은 `src/`, `content/`, `build.py`, **`dist/assets/`** 입니다.
특히 `dist/assets/`의 이미지·폰트·CV는 빌드로 재생성되지 않으므로 삭제하거나
빌드 전 정리 대상으로 지정하지 마세요. `build.py`는 삭제 동기화를 하지 않으며,
기존 `images/`, `Sangmin_Bae_files/`, `CNAME`을 보존합니다.
`dist/CNAME`에는 루트 `CNAME`을 그대로 복사하고 `.nojekyll`을 함께 게시합니다.

수정할 때는 아래 Update 항목의 원본을 편집하고 위의 빌드·검사 명령을 실행한 뒤,
원본과 `dist/`, 루트의 생성 파일을 **함께** 커밋합니다. 나중에 별도 배포 승인을
받아 `main`에 merge/push하면 기존 GitHub Pages 기본 배포가 게시합니다.
Pages 설정이나 DNS 변경, 새로운 배포 workflow는 필요하지 않습니다.
`EXPORT-MANIFEST.json`은 최초 ZIP의 해시 기록이며 이후 빌드 결과 목록이 아닙니다.

## 마이그레이션 기록 (2026-10-18)

- 저장소: `git@github.com:raymin0223/raymin0223.github.io.git` (기존 clone 재사용)
- 시작 브랜치: `main`
- 시작 커밋: `e27ba07214eca1fa23dd60953d314f8641b17406`
- 작업 브랜치: `homepage/zip-migration-20261018`
- 입력: 저장소 루트의 `sangmin-bae-site-export.zip`
- ZIP SHA-256: `b0c578e6b371077ffe4d240f0e9b5a3de0ffe3971b4dbc0d2cbab3d4a724a47f`
- 시작 시 미커밋 항목은 위 ZIP 하나뿐이었습니다. 파일은 그대로 보존하고
  `.gitignore`에 추가해 사이트에 게시되지 않도록 했습니다.
- GitHub 공개 workflow 목록에는 `dynamic/pages/pages-build-deployment`만 있고,
  [최근 성공한 배포](https://github.com/raymin0223/raymin0223.github.io/actions/runs/28445755515)는
  시작 커밋의 `main` 배포입니다. 저장소에 `.github/workflows/`나 `docs/`는 없습니다.
  이 기록과 루트의 기존 사이트 파일을 근거로 `main / (root)` 배포를 유지했습니다.
  인증이 필요한 Pages 설정 API는 비인증 요청에 404를 반환해 직접 열람하지 못했습니다.
- 기존 `CNAME`의 `www.raymin0223.com`을 바이트 단위로 유지했습니다.
  확인 당시 apex는 www로 이동하고, www의 DNS CNAME은 `raymin0223.github.io`였습니다.
  DNS 및 GitHub 설정 변경, push, merge는 수행하지 않았습니다.
- 스타일·문구·논문 분류·필터 순서는 ZIP 그대로입니다. 도메인 메타데이터 변경,
  canonical 추가, 배포 파일 복사, 기존 섹션 링크 호환성만 구현에 추가했습니다.
- 기존 파일 46개(`CNAME`, `images/`, `Sangmin_Bae_files/`)를 수정 없이 유지했습니다.
  `/index.html#publications`, `#patents`, `#awards`, `#experience`, `#education`은
  유지되고, `#projects`와 `#services`는 해당 접이식 패널을 자동으로 엽니다.
- 기존 CV 링크는 외부 Google Drive 폴더여서 로컬 PDF 경로는 없었습니다.
  새 CV는 ZIP의 `/assets/Sangmin_Bae_CV.pdf`입니다. 외부 논문·프로젝트 링크는
  승인된 ZIP의 데이터를 유지하며 외부 서비스 자체를 변경하지 않았습니다.

### 검증 결과

- Chromium 156에서 데스크톱(1440×1000)·모바일(390×844)의 라이트·다크 모드
  4가지 조합을 확인했습니다. 각 전체 페이지 캡처는 ZIP 원본 캡처와 픽셀까지
  일치합니다. 320·360·768·1024px에서도 가로 넘침이 없습니다.
- 각 조합에서 필터 25가지(개별·복합·결과 없음), 검색, 초기화, 선택 논문 목록
  유지, 그림 확대 10개와 원본 링크, BibTeX 대화상자 및 실제 클립보드 내용,
  CV 다운로드 파일, 테마 전환·저장, 기존 섹션 링크를 확인했습니다.
  모바일 메뉴와 Citation pending 표시도 정상이며 브라우저 오류는 없습니다.
- 원본 자산 15개의 SHA-256, 논문·인용·그림 출처 데이터, CSS가 ZIP과 같습니다.
  기존 파일 46개의 내용과 로컬 HTTP 200 응답을 확인했습니다.
  빌드를 두 번 더 실행해도 파일 내용이 바뀌지 않고 원본 자산이 보존됩니다.
- `python3 scripts/check_site.py`와 `git diff --check`를 통과했습니다.
  이 환경의 화면 캡처와 JSON 검증 결과는 `.migration-preview/`에 보관하며,
  Git 및 실제 배포에는 포함하지 않습니다.
- 모바일 검증은 브라우저의 모바일 화면 에뮬레이션입니다. 원격 서비스 배포는
  요청에 따라 수행하지 않았으므로 실제 배포 후 도메인에서의 확인은 별도입니다.

## Update

- Edit src/index.html for biography, experience, highlights, and general content.
- Edit content/publications.json for papers, author order, venues, and links.
- Edit content/citations.json for source-backed BibTeX, citation source links, and verification notes.
- Figure source URLs, original figure numbers, and extraction details are recorded in content/figures.json. Paper image dimensions and alt text live in content/publications.json.
- Edit src/styles.css for appearance and responsive layouts.
- Edit src/app.js for filters, citations, theme, and navigation.
- Replace dist/assets/Sangmin_Bae_CV.pdf when updating the CV.
- Run `python3 build.py` to update `dist/` and the root publishing files, then `python3 scripts/check_site.py`.

The page order is About/News, Education, Research, Selected Publications, Experience, Awards & Honors, Patents, and All Publications. Selected papers have their own list; search and topic/type/year filters apply only to All Publications. Publication types are Conference, Journal, Preprint, Workshop, and Thesis, and can be combined with the other filters. Both lists share the same paper metadata and citation dialog. Research projects, teaching, and academic service are grouped under Experience.

The portable site is built in `dist/`. In this repository, its contents are also copied to the root for the existing GitHub Pages branch deployment. Legacy assets stay at their existing root paths. Update absolute metadata URLs in `src/index.html` and `build.py`, plus `CNAME`, if deliberately changing the domain in the future.

## Content provenance

The attached CV dated October 17, 2026 supplies roles, education, publication metadata, projects, patents, and honors, with subsequent author-requested corrections recorded in the source. The portrait is from the existing personal website at https://www.raymin0223.com/. Paper figures use original arXiv images or precisely rendered figure regions, with source provenance in content/figures.json. Research-highlight descriptions are concise paraphrases of the corresponding arXiv abstracts. OPRD uses its complete Figure 1; BASTION uses its Figure 3 method diagram. Research highlights use three side-by-side panels on desktop. Selected figures share a 16:9 frame with consistent width and padding, preserving each original image ratio. Every selected figure can be enlarged or opened at full resolution.

Design references: the concise introductions and research-first information hierarchy of https://tridao.me/ and https://karpathy.ai/. Layout, typography, and implementation are original. The palette is based on KAIST logo colors, with a brighter primary blue (#1266B0) for light mode, KAIST Blue (#1487C8) in illustrations, and Light Blue (#5FBEEB) for dark mode. Color reference: https://www.kaist.ac.kr/en/html/kaist/011901.html.

## Notes

- News acceptance months follow the official 2026 author-notification dates: NeurIPS, September 24 (https://neurips.cc/Conferences/2026/Dates); EMNLP, August 20 (https://2026.emnlp.org/).
- The current affiliation follows the supplied CV: KAIST AI, Postdoctoral Researcher.
- Paper resources use CV URLs, with verified corrections where necessary. DualDrift uses the OpenReview URL linked by the official NeurIPS 2026 conference record. TAC-CoT has no paper URL in the CV, so its record has no Paper button.
- Publication categories follow the author's requested groupings. Papers can appear under multiple specific topics. Other research is an exclusive fallback: a paper in any specific topic cannot also appear there. The build enforces this rule.
- Citations are stored records, not generated from the CV or scraped from Google Scholar. The citation dialog links to the source: publisher/proceedings exports, publisher-deposited Crossref DOI records, or arXiv exports. Preprint citations are explicitly identified. DualDrift is formatted from official NeurIPS conference metadata and is labeled accordingly. No unverified volume, page, or DOI fields are added.
- Publisher bibliographic fields are retained, including author order and titles that differ from the CV. Duplicate BibTeX entry keys are disambiguated; the original export is retained in content/citations.json. PMLR's abstract field is omitted for a shorter citation.
- TAC-CoT has no verified official bibliographic record yet and shows Citation pending. The author selected the revised Tabular paper, Fine-tuned In-Context Learning Transformers are Excellent Tabular Data Classifiers; its title, four authors, year (2025), preprint venue, URL, and citation now follow the current official arXiv record.
- OPRD's Code links point to the author's official repository, https://github.com/raymin0223/on_policy_reverse_distillation. A link does not imply that implementation files have already been released.
