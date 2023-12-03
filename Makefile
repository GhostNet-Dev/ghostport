



web:
	tsc -p tsconfig-web.json

electron:
	tsc -p tsconfig.json

docker_volume:
	docker volume create --name ghost

docker_build:
	docker build . -t ghost --build-arg DIABLE_CACHE=0

docker_run:
	docker run -it --rm --name ghostd -v ghost:/usr/src/app --net=bridge -p 8090:8090 -p 8091:8091 -p 50129:50129/udp -p 58080:58080 ghost
