# AI 고객 지원 챗봇 프로젝트

## 프로젝트 개요

Claude API를 활용한 고객 지원 챗봇 웹 애플리케이션. 사용자는 로그인 후 AI와 대화하며 지원을 받을 수 있으며, 대화 히스토리가 저장되고 파일/이미지 첨부가 가능하다.

---

## 기술 스택

| 구분 | 기술 |
|------|------|
| 프레임워크 | Next.js (App Router, 풀스택) |
| 언어 | TypeScript |
| AI 모델 | Claude API (`claude-sonnet-4-6`) |
| 데이터베이스 | MongoDB (Mongoose ODM) |
| 인증 | NextAuth.js |
| 스타일링 | Tailwind CSS |
| 배포 | Google Cloud Run |
| 파일 저장소 | 미정 (AWS S3 또는 GCS 검토 예정) |

---

## 핵심 기능

- **스트리밍 응답**: AI 답변을 실시간으로 타이핑 효과처럼 표시 (Server-Sent Events / ReadableStream)
- **대화 히스토리**: 사용자별 대화 세션 저장 및 이전 대화 불러오기
- **사용자 인증**: NextAuth.js 기반 로그인/회원가입, 세션 관리
- **파일/이미지 업로드**: 문서나 이미지를 첨부하여 AI와 대화
- **지식 베이스**: 추후 결정 (시스템 프롬프트 고정 또는 RAG 방식 검토 예정)

---

## 프로젝트 구조

```
/
├── app/
│   ├── api/
│   │   ├── auth/          # NextAuth.js 라우트
│   │   ├── chat/          # 채팅 API (스트리밍)
│   │   ├── conversations/ # 대화 히스토리 CRUD
│   │   └── upload/        # 파일 업로드
│   ├── (auth)/
│   │   ├── login/
│   │   └── register/
│   ├── chat/
│   │   └── [conversationId]/
│   └── layout.tsx
├── components/
│   ├── chat/              # 채팅 UI 컴포넌트
│   └── ui/                # 공통 UI 컴포넌트
├── lib/
│   ├── anthropic.ts       # Claude API 클라이언트
│   ├── mongodb.ts         # MongoDB 연결
│   └── auth.ts            # NextAuth 설정
├── models/
│   ├── User.ts
│   ├── Conversation.ts
│   └── Message.ts
└── types/
    └── index.ts
```

---

## 데이터 모델

### User
```ts
{
  _id: ObjectId,
  email: string,
  name: string,
  image?: string,
  createdAt: Date
}
```

### Conversation
```ts
{
  _id: ObjectId,
  userId: ObjectId,
  title: string,
  createdAt: Date,
  updatedAt: Date
}
```

### Message
```ts
{
  _id: ObjectId,
  conversationId: ObjectId,
  role: 'user' | 'assistant',
  content: string,
  attachments?: { url: string, type: string, name: string }[],
  createdAt: Date
}
```

---

## Claude API 사용 지침

- 모델: `claude-sonnet-4-6`
- 스트리밍: `stream: true` 옵션 사용
- 시스템 프롬프트: 고객 지원 역할 명시 (추후 지식 베이스 방식 확정 후 업데이트)
- 이미지 입력: `content` 배열에 `image` 블록 포함 (base64 또는 URL)
- 최대 토큰: 응답은 `max_tokens: 2048` 기본값 사용

```ts
// lib/anthropic.ts
import Anthropic from '@anthropic-ai/sdk'
export const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
```

---

## 환경 변수

```env
# .env.local
ANTHROPIC_API_KEY=
MONGODB_URI=
NEXTAUTH_SECRET=
NEXTAUTH_URL=

# 파일 저장소 (미정, 결정 후 추가)
# AWS_S3_BUCKET=
# AWS_ACCESS_KEY_ID=
# AWS_SECRET_ACCESS_KEY=
```

---

## 코드 컨벤션

- TypeScript strict 모드 사용
- `async/await` 사용, `then/catch` 체이닝 지양
- API Route는 `app/api/` 하위에 `route.ts`로 작성
- 컴포넌트는 함수형, `'use client'` 지시어 최소화 (서버 컴포넌트 우선)
- 에러 응답: `{ error: string }` 형태로 통일
- MongoDB 연결은 `lib/mongodb.ts`의 싱글턴 패턴 사용

---

## 배포 (Google Cloud Run)

- Docker 이미지 빌드 후 Artifact Registry 업로드
- Cloud Run 서비스로 배포, 환경 변수는 Secret Manager 사용
- `next.config.ts`에 `output: 'standalone'` 설정 필요
- MongoDB는 MongoDB Atlas 사용 (Cloud Run에서 연결)

---

## 미결정 사항

- [x] 파일 저장소: **Google Cloud Storage** 선택 (Cloud Run과 동일 인프라)
- [ ] 지식 베이스 방식: 시스템 프롬프트 고정 vs RAG 구현 결정 필요 (현재: 시스템 프롬프트 고정으로 구현)
- [x] 소셜 로그인 제공자: **Google OAuth** 선택 (NextAuth.js Google Provider)
