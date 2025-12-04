.PHONY: build dev install lint test typecheck fmt clean integration

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

integration:
	npm run integration

typecheck:
	npx tsc --noEmit

fmt:
	npx prettier --write .

clean:
	rm -rf dist

deploy:
	yarn --force
	make build
	npx commit-and-tag-version
	npm publish
	git push
	git push --tags
