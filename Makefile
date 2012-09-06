
CORE_FILES	= $(wildcard core/*.js)
MODULE_FILES	= $(wildcard modules/*.js)
CORE_BUILD	= core.js
MODULES_BUILD	= modules.js
BUILD_DIR	= .build
VERSION		= $(shell git describe)
BUILD		= $(shell git rev-list HEAD | wc -l)
HASH		= $(shell git log --pretty=format:'%h' -n 1)
RELEASE_DATE	= $(shell git show -s --format="%ci")
CODENAME	= $(shell git tag -l -n1 | cut -c17-)
AUTHOR		= Filip Moberg


$(shell [ -d "${BUILD_DIR}" ] || mkdir -p ${BUILD_DIR})


clean:
	@rm -rf ${BUILD_DIR}


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

	@echo "\nVersion built: inception-${VERSION}.${BUILD}.js\n" 



install:
	@cat template/inception.tmpl.js | \
	sed -e "s/\[ PRAGMA :: HEADER_AUTHOR \]/${AUTHOR}/" | \
	sed -e "s/\[ PRAGMA :: HEADER_VERSION \]/${VERSION}.${BUILD}/" | \
	sed -e "s/\[ PRAGMA :: HEADER_RELEASE_DATE \]/${RELEASE_DATE}/" | \
	sed -e "s/\[ PRAGMA :: HEADER_CODENAME \]/${CODENAME}/" | \
	sed -e "/\[ PRAGMA :: CORE \]/ { r ${BUILD_DIR}/core.js" -e "d}" | \
	sed -e "/\[ PRAGMA :: MODULES \]/ { r ${BUILD_DIR}/modules.js" -e "d}" \
	> inception-${VERSION}.${BUILD}.js

	@echo "\nVersion installed: inception-${VERSION}.${BUILD}.js\n" 

all:
	@make clean
	@make build
	@make install
