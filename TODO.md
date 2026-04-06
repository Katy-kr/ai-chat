# 실행 계획 TODO

## Phase 1 — 프로젝트 초기 설정

- [x] **1.1** Next.js 프로젝트 생성 (`npx create-next-app@latest` — TypeScript, Tailwind CSS, App Router 선택)
- [x] **1.2** `next.config.ts`에 `output: 'standalone'` 설정 (Cloud Run 배포 대비)
- [x] **1.3** 필수 패키지 설치
  - `@anthropic-ai/sdk`
  - `mongoose`
  - `next-auth`
  - `next-auth/adapters` (MongoDB adapter)
- [x] **1.4** `.env.local` 파일 생성 및 환경 변수 키 작성 (`ANTHROPIC_API_KEY`, `MONGODB_URI`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`)
- [x] **1.5** `types/index.ts` — 공통 TypeScript 타입 정의 (Message, Conversation, User 인터페이스)

---

## Phase 2 — 데이터베이스 & 인증

- [ ] **2.1** MongoDB Atlas 클러스터 생성 및 연결 문자열 확보 _(외부 설정 필요)_
- [x] **2.2** `lib/mongodb.ts` — 싱글턴 Mongoose 연결 유틸리티 작성
- [x] **2.3** `models/User.ts` — Mongoose 스키마 정의
- [x] **2.4** `models/Conversation.ts` — Mongoose 스키마 정의
- [x] **2.5** `models/Message.ts` — Mongoose 스키마 정의 (attachments 배열 포함)
- [x] **2.6** NextAuth.js 소셜 로그인 제공자 결정 → **Google OAuth 선택**
- [x] **2.7** `lib/auth.ts` — NextAuth 설정 (Google provider, JWT 세션 전략)
- [x] **2.8** `app/api/auth/[...nextauth]/route.ts` — NextAuth API 라우트 연결
- [ ] **2.9** 인증 흐름 로컬 테스트 (로그인 → 세션 생성 확인) _(수동 테스트 필요)_

---

## Phase 3 — Claude API 연동 & 채팅 API

- [x] **3.1** `lib/anthropic.ts` — Anthropic 클라이언트 싱글턴 생성
- [x] **3.2** 고객 지원용 시스템 프롬프트 초안 작성 (`lib/anthropic.ts` 내 `SYSTEM_PROMPT`)
- [x] **3.3** `app/api/chat/route.ts` — 스트리밍 채팅 API 구현
  - 요청: `{ conversationId, message, attachments? }`
  - Claude API 호출 (`stream: true`, `max_tokens: 2048`)
  - `ReadableStream`으로 응답 스트리밍
- [x] **3.4** `app/api/conversations/route.ts` — 대화 목록 조회(GET) / 신규 대화 생성(POST)
- [x] **3.5** `app/api/conversations/[id]/route.ts` — 특정 대화 조회(GET) / 삭제(DELETE)
- [x] **3.6** `app/api/conversations/[id]/messages/route.ts` — 메시지 목록 조회(GET)
- [x] **3.7** API 라우트 전체에 인증 적용 (`getServerSession` + `middleware.ts`)

---

## Phase 4 — 파일/이미지 업로드

- [x] **4.1** 파일 저장소 결정 → **Google Cloud Storage 선택**
- [x] **4.2** `lib/storage.ts` — GCS 업로드 유틸리티 작성 (`@google-cloud/storage`)
- [x] **4.3** `app/api/upload/route.ts` — 파일 업로드 API 구현 (URL 반환)
- [x] **4.4** 이미지의 경우 Claude API `content` 배열에 `image` 블록 포함 처리

---

## Phase 5 — 프론트엔드 UI

- [x] **5.1** `app/layout.tsx` — 공통 레이아웃 (SessionProvider 래핑 포함)
- [x] **5.2** `app/(auth)/login/page.tsx` — 로그인 페이지 (Google 로그인 버튼)
- [ ] **5.3** `app/(auth)/register/page.tsx` — 회원가입 페이지 _(소셜 로그인만 사용하므로 불필요)_
- [x] **5.4** `components/ui/` — 공통 컴포넌트 작성 (Button, Input, Spinner)
- [x] **5.5** `components/chat/ConversationSidebar.tsx` — 대화 목록 사이드바
- [x] **5.6** `components/chat/MessageList.tsx` — 메시지 목록 표시 (사용자/AI 구분)
- [x] **5.7** `components/chat/MessageInput.tsx` — 입력창 + 파일 첨부 버튼
- [x] **5.8** `components/chat/StreamingMessage.tsx` — 스트리밍 응답 실시간 렌더링
- [x] **5.9** `app/chat/[conversationId]/page.tsx` — 채팅 메인 페이지 조합
- [x] **5.10** 반응형 레이아웃 (모바일 사이드바 토글 처리)

---

## Phase 6 — 지식 베이스 (미결정 사항 확정 후 진행)

- [ ] **6.1** 방식 결정: 시스템 프롬프트 고정 vs RAG _(현재: 시스템 프롬프트 고정으로 임시 구현)_
- [ ] **6.2-A** (시스템 프롬프트) 고객 지원 문서를 정리하여 프롬프트에 삽입
- [ ] **6.2-B** (RAG) 벡터 DB 선택 (Pinecone / MongoDB Atlas Vector Search) 및 임베딩 파이프라인 구축

---

## Phase 7 — 배포

- [x] **7.1** `Dockerfile` 작성 (Node.js 기반, standalone 빌드 활용)
- [x] **7.2** `.dockerignore` 작성
- [ ] **7.3** Google Cloud 프로젝트 설정 (Artifact Registry, Cloud Run API 활성화) _(외부 설정 필요)_
- [ ] **7.4** Secret Manager에 환경 변수 등록 _(외부 설정 필요)_
- [ ] **7.5** 로컬에서 Docker 빌드 및 동작 확인 _(수동 실행 필요)_
- [ ] **7.6** Artifact Registry에 이미지 푸시 _(외부 설정 필요)_
- [ ] **7.7** Cloud Run 서비스 배포 및 환경 변수 연결 _(외부 설정 필요)_
- [ ] **7.8** 커스텀 도메인 연결 (필요 시)

---

## Phase 8 — 마무리

- [x] **8.1** 에러 처리 전반 검토 (API 오류, 네트워크 오류 사용자 피드백)
- [x] **8.2** 로딩/스켈레톤 UI 적용 (Spinner 컴포넌트 활용)
- [x] **8.3** `CLAUDE.md` 미결정 사항 업데이트 (파일 저장소, 소셜 로그인 확정)
- [ ] **8.4** 기본 E2E 시나리오 수동 테스트 (로그인 → 대화 생성 → 메시지 전송 → 히스토리 확인) _(수동 테스트 필요)_

---

## Phase 9 — 버그 수정

> 코드 검토에서 발견된 실제 동작 오류

- [ ] **9.1** `app/api/chat/route.ts` — MongoDB ObjectId 유효성 검사 추가
  - 현재: 유효하지 않은 `conversationId`가 들어오면 Mongoose `CastError` → 500 반환
  - 수정: `mongoose.isValidObjectId()` 확인 후 400 반환
- [ ] **9.2** `app/api/conversations/[id]/route.ts` — 동일한 ObjectId 유효성 검사 추가
- [ ] **9.3** `app/chat/[conversationId]/page.tsx` — ObjectId 유효성 검사 추가 (CastError → 404 처리)
- [ ] **9.4** `app/api/chat/route.ts` — 스트리밍 오류 시 클라이언트에 오류 전달
  - 현재: Anthropic API 오류 발생 시 스트림이 그냥 닫혀 클라이언트는 빈 응답 수신
  - 수정: 오류 발생 시 `controller.error()` 또는 오류 텍스트를 스트림으로 전송
- [ ] **9.5** `app/api/chat/route.ts` — 스트리밍 오류 시 저장된 사용자 메시지 롤백
  - 현재: Claude API 호출 전 오류 시 사용자 메시지는 DB에 저장되지만 어시스턴트 응답 없이 대화가 끊김
  - 수정: 스트리밍 실패 시 해당 사용자 메시지도 삭제
- [ ] **9.6** `ChatView.tsx` — HTTP 401 응답 시 `/login`으로 리다이렉트
  - 현재: JWT 만료 후 전송 시 generic 오류 메시지 표시
- [ ] **9.7** `components/chat/MessageInput.tsx` — 파일 업로드 실패 시 사용자에게 오류 메시지 표시
  - 현재: `res.ok`가 false이면 파일이 조용히 무시됨
- [ ] **9.8** `components/chat/ConversationSidebar.tsx` — fetch 실패 시 오류 상태 표시
  - 현재: API 실패 시 `loading`만 false가 되고 빈 목록 표시

---

## Phase 10 — 보안 강화

- [ ] **10.1** `lib/storage.ts` — `makePublic()` 제거 후 Signed URL 방식으로 전환
  - 현재: 업로드된 모든 파일(PDF, 개인 문서 포함)이 공개 URL로 영구 노출
  - 수정: `getSignedUrl()`로 시간 제한 URL 생성, `app/api/files/[id]/route.ts` 프록시 엔드포인트 추가
- [ ] **10.2** `app/api/chat/route.ts` — Rate Limiting 추가
  - 현재: 사용자당 Claude API 호출 횟수 제한 없음 → 비용 폭발 위험
  - 수정: Redis 또는 메모리 기반 rate limiter 적용 (예: `upstash/ratelimit`)
- [ ] **10.3** `app/api/chat/route.ts` — 메시지 길이 제한 추가
  - 현재: 매우 긴 메시지(수만 자)가 그대로 Claude에 전달될 수 있음
  - 수정: 최대 길이(예: 4,000자) 초과 시 400 반환
- [ ] **10.4** `lib/auth.ts` — NextAuth 오류 페이지 설정 (`pages.error`)
  - 현재: OAuth 오류(access_denied 등) 시 NextAuth 기본 에러 페이지로 이동
  - 수정: `pages: { error: '/login' }` 추가 및 로그인 페이지에서 오류 메시지 표시

---

## Phase 11 — 누락된 기능

- [ ] **11.1** `PATCH /api/conversations/[id]` — 대화 제목 수동 변경 API
  - 현재: 제목은 첫 메시지 전송 시 자동 설정만 되고, 수동 변경 불가
- [ ] **11.2** `ConversationSidebar.tsx` — 대화 제목 인라인 편집 UI
  - 11.1 완료 후 구현: 사이드바에서 제목 더블클릭 → 편집 모드
- [ ] **11.3** `ChatView.tsx` ↔ `ConversationSidebar.tsx` — 제목 자동 업데이트 동기화
  - 현재: 첫 메시지 전송 후 서버에서 제목이 바뀌어도 사이드바가 갱신되지 않음
  - 수정: `router.refresh()` 호출 또는 Context/상태 공유로 사이드바 재조회
- [ ] **11.4** PDF / 텍스트 파일 내용을 Claude에게 전달
  - 현재: 이미지만 `image` 블록으로 처리. PDF/txt는 URL이 저장될 뿐 Claude가 내용을 읽지 못함
  - 수정: PDF는 `pdf-parse` 라이브러리로 텍스트 추출, txt는 직접 읽어 `text` 블록으로 삽입
- [ ] **11.5** `app/not-found.tsx` — 전역 404 페이지 추가
- [ ] **11.6** `app/error.tsx` — 전역 오류 UI 추가 (React Error Boundary)

---

## Phase 12 — 설정 및 최적화

- [ ] **12.1** `next.config.ts` — `images.remotePatterns` 설정 추가
  - 현재: GCS 이미지, Google 프로필 이미지가 `next/image`에서 차단됨 → `<img>` 직접 사용 중
  - 수정: `storage.googleapis.com`, `lh3.googleusercontent.com` 도메인 허용 후 `next/image`로 교체
- [ ] **12.2** MongoDB 복합 인덱스 추가
  - `models/Conversation.ts`: `{ userId: 1, updatedAt: -1 }` 복합 인덱스
  - `models/Message.ts`: `{ conversationId: 1, createdAt: 1 }` 복합 인덱스
- [ ] **12.3** `lib/mongodb.ts` 또는 `instrumentation.ts` — 서버 시작 시 필수 환경 변수 일괄 검증
  - 현재: 각 모듈에서 개별적으로 오류 발생 → 디버깅 어려움
  - 수정: 앱 초기화 시 누락된 env var 목록을 한 번에 출력 후 종료
