
CORE_FILES	= $(wildcard core/*.js)
MODULE_FILES	= $(wildcard modules/*.js)
CORE_BUILD	= core.js
MODULES_BUILD	= modules.js
BUILD_DIR	= .build
VERSION		= $(shell git describe --abbrev=4 HEAD)
HASH		= $(shell git log --pretty=format:'%h' -n 1)
RELEASE_DATE	= $(shell git show -s --format="%ci")
CODENAME	= $(shell git tag -l -n1 | cut -c17-)
AUTHOR		= Filip Moberg


$(shell [ -d "${BUILD_DIR}" ] || mkdir -p ${BUILD_DIR})


clean:
	@rm -rf ${BUILD_DIR}
	@rm inception.*


modules.js: ${MODULE_FILES}

	$(shell [ -f "${BUILD_DIR}/$@" ] || touch ${BUILD_DIR}/$@)

	@for file in $^; do \
		cat "$$file" | sed -e "$$(cat $$file | wc -l), $$ s/$$/,/" ; \
	done > ${BUILD_DIR}/$@

	@cat ${BUILD_DIR}/$@ | sed -e "$$(cat ${BUILD_DIR}/$@ | wc -l), $$ s/.$$//" > ${BUILD_DIR}/$@


core.js: ${CORE_FILES}

	$(shell [ -f "${BUILD_DIR}/$@" ] || touch ${BUILD_DIR}/$@)

	@for file in $^; do \
		cat "$$file" | sed -e "$$(cat $$file | wc -l), $$ s/$$/,/" ; \
	done > ${BUILD_DIR}/$@

	@cat ${BUILD_DIR}/$@ | sed -e "$$(cat ${BUILD_DIR}/$@ | wc -l), $$ s/.$$//" > ${BUILD_DIR}/$@


build: core.js modules.js

	@echo "\nVersion built: $$(git describe --abbrev=4 HEAD)-$$(git log --pretty=format:'%h' -n 1).js\n" 

build-custom:
ifdef CORE_FILES2
	cat ${core} > build/core.js
	cat ${modules} > build/modules.js
endif


install:
	@cat template/inception.tmpl.js | \
	sed -e "s/\[ PRAGMA :: HEADER_AUTHOR \]/${AUTHOR}/" | \
	sed -e "s/\[ PRAGMA :: HEADER_VERSION \]/${VERSION}/" | \
	sed -e "s/\[ PRAGMA :: HEADER_HASH \]/${HASH}/" | \
	sed -e "s/\[ PRAGMA :: HEADER_RELEASE_DATE \]/${RELEASE_DATE}/" | \
	sed -e "s/\[ PRAGMA :: HEADER_CODENAME \]/${CODENAME}/" | \
	sed -e "/\[ PRAGMA :: CORE \]/ { r ${BUILD_DIR}/core.js" -e "d}" | \
	sed -e "/\[ PRAGMA :: MODULES \]/ { r ${BUILD_DIR}/modules.js" -e "d}" \
	> inception.$$(git describe --abbrev=4 HEAD)-$$(git log --pretty=format:'%h' -n 1).js

	@echo "\nVersion installed: inception.$$(git describe --abbrev=4 HEAD)-$$(git log --pretty=format:'%h' -n 1).js\n" 

all:
	@make clean
	@make build
	@make install
