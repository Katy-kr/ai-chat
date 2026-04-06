# ============================================================
# AI 고객 지원 챗봇 — Makefile
# ============================================================
# 사용법: make <target>
# 예시:   make dev, make build, make deploy
# ============================================================

# ── 프로젝트 설정 (필요 시 수정) ────────────────────────────
APP_NAME   := ai-chat
GCP_PROJECT := sodium-gateway-492209-i6
GCP_REGION  := asia-northeast3
AR_REPO     := $(GCP_REGION)-docker.pkg.dev/$(GCP_PROJECT)/$(APP_NAME)
IMAGE       := $(AR_REPO)/$(APP_NAME)
IMAGE_TAG   := $(IMAGE):$(shell git rev-parse --short HEAD 2>/dev/null || echo latest)

.PHONY: help init dev build start lint typecheck \
        docker-build docker-run docker-push \
        cloudbuild gcp-setup deploy clean

# ── 기본 타겟: 도움말 ────────────────────────────────────────
help:
	@echo ""
	@echo "사용 가능한 명령어:"
	@echo ""
	@echo "  초기화"
	@echo "    make init          패키지 설치"
	@echo ""
	@echo "  개발"
	@echo "    make dev           개발 서버 실행 (localhost:3000)"
	@echo "    make typecheck     TypeScript 타입 체크"
	@echo "    make lint          ESLint 실행"
	@echo ""
	@echo "  빌드"
	@echo "    make build         Next.js 프로덕션 빌드"
	@echo "    make start         빌드된 서버 로컬 실행"
	@echo ""
	@echo "  Docker"
	@echo "    make docker-build  Docker 이미지 빌드"
	@echo "    make docker-run    Docker 컨테이너 로컬 실행"
	@echo "    make docker-push   Artifact Registry에 이미지 푸시"
	@echo ""
	@echo "  GCP / 배포"
	@echo "    make gcp-setup     Artifact Registry 저장소 생성"
	@echo "    make cloudbuild    Cloud Build로 이미지 빌드 & 푸시 (로컬 Docker 불필요)"
	@echo "    make deploy        Cloud Build → Cloud Run 배포"
	@echo ""
	@echo "  기타"
	@echo "    make clean         빌드 캐시 및 node_modules 삭제"
	@echo ""

# ── 초기화 ───────────────────────────────────────────────────
init:
	npm install

# ── 개발 ────────────────────────────────────────────────────
dev:
	npm run dev

typecheck:
	npx tsc --noEmit

lint:
	npm run lint

# ── 빌드 ────────────────────────────────────────────────────
build:
	npm run build

start: build
	npm run start

# ── Docker ──────────────────────────────────────────────────
docker-build:
	docker build -t $(IMAGE_TAG) -t $(IMAGE):latest .

# .env.local 을 --env-file 로 주입하여 로컬에서 컨테이너 실행
docker-run: docker-build
	docker run --rm -p 3000:3000 --env-file .env.local $(IMAGE):latest

docker-push: docker-build
	docker push $(IMAGE_TAG)
	docker push $(IMAGE):latest

# ── GCP 설정 ────────────────────────────────────────────────
gcp-setup:
	gcloud services enable \
		artifactregistry.googleapis.com \
		run.googleapis.com \
		secretmanager.googleapis.com \
		--project=$(GCP_PROJECT)
	gcloud artifacts repositories create $(APP_NAME) \
		--repository-format=docker \
		--location=$(GCP_REGION) \
		--project=$(GCP_PROJECT) \
		--quiet || true
	gcloud auth configure-docker $(GCP_REGION)-docker.pkg.dev --quiet

# ── Cloud Build (로컬 Docker 없이 빌드 & 푸시) ──────────────
# 사전 조건: gcp-setup 완료
cloudbuild:
	gcloud builds submit \
		--tag=$(IMAGE):latest \
		--project=$(GCP_PROJECT)

# ── 배포 ────────────────────────────────────────────────────
# 사전 조건: cloudbuild 완료, Secret Manager에 ANTHROPIC_API_KEY 등록 필요
# Secret 등록:
#   echo -n "sk-ant-..." | gcloud secrets create ANTHROPIC_API_KEY --data-file=- --project=$(GCP_PROJECT)
deploy: cloudbuild
	gcloud run deploy $(APP_NAME) \
		--image=$(IMAGE):latest \
		--region=$(GCP_REGION) \
		--platform=managed \
		--allow-unauthenticated \
		--port=3000 \
		--min-instances=0 \
		--set-secrets="ANTHROPIC_API_KEY=ANTHROPIC_API_KEY:latest" \
		--project=$(GCP_PROJECT)

# ── 정리 ────────────────────────────────────────────────────
clean:
	rm -rf .next node_modules
