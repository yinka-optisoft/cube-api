MOCHA = @./node_modules/.bin/mocha
test:
	$(MOCHA) --require babel-core/register

.PHONY: test