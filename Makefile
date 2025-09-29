.PHONY: build dev install lint test typecheck fmt clean

checks:
	make fmt
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

unit:
	npm run unit

typecheck:
	npx tsc --noEmit

fmt:
	npx prettier --write .

clean:
	rm -rf dist
