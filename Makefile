.PHONY: build dev install lint test typecheck fmt

checks:
	make lint
	make typecheck

install:
	npm install

dev:
	npm run dev

build:
	npm run build

lint:
	npm run lint

typecheck:
	npx tsc --noEmit

fmt:
	npx prettier --write .
