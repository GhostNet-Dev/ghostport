



web:
	tsc -p tsconfig-web.json

electron:
	tsc -p tsconfig.json

docker_build:
	docker build . -t ghost

docker_run:
	docker run --net=host -p 8090:8090 -p 8091:8091 -p 50128:50128/udp -p 58080:58080