.DEFAULT_GOAL := dev

APP_DIR := app
APP_NODE_MODULES := $(APP_DIR)/node_modules
APP_INSTALL_STAMP := $(APP_NODE_MODULES)/.install-stamp
APP_PACKAGE_JSON := $(APP_DIR)/package.json
APP_PACKAGE_LOCK := $(APP_DIR)/package-lock.json
APP_INSTALL_INPUTS := $(APP_PACKAGE_JSON) $(wildcard $(APP_PACKAGE_LOCK))

.PHONY: all help install-app dev build preview clean

all: build

help:
	@echo "Usage: make <target>"
	@echo ""
	@echo "  dev          Install dependencies if needed and start the Vite dev server"
	@echo "  build        Install dependencies if needed and build the app"
	@echo "  preview      Install dependencies if needed and preview the production build"
	@echo "  clean        Remove app/dist and app/node_modules"

$(APP_INSTALL_STAMP): $(APP_INSTALL_INPUTS)
	if [ -f $(APP_PACKAGE_LOCK) ]; then cd $(APP_DIR) && npm ci; else cd $(APP_DIR) && npm install; fi
	mkdir -p $(APP_NODE_MODULES)
	touch $(APP_INSTALL_STAMP)

install-app: $(APP_INSTALL_STAMP)

dev: install-app
	cd $(APP_DIR) && npm run dev

build: install-app
	cd $(APP_DIR) && npm run build

preview: install-app
	cd $(APP_DIR) && npm run preview

clean:
	rm -rf $(APP_DIR)/dist $(APP_NODE_MODULES)
