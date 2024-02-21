



web:
	tsc -p tsconfig-web.json

electron:
	tsc -p tsconfig.json

docker_volume:
	docker volume create --name ghost

docker_build:
	docker build . -t ghost --build-arg DIABLE_CACHE=0 -f Dockerfile.base

docker_run:
	docker run -it --rm --name ghostd -f Dockerfile.base -v ghost:/usr/src/app --net=host -p 8090:8090 -p 8091:8091 -p 50129:50129/udp -p 58080:58080 ghost

cuda_volume:
	docker volume create --name ghost_cuda

cuda_build:
	docker build . -t ghost_cuda --build-arg DIABLE_CACHE=0 -f Dockerfile.cuda

cuda_run:
	docker run -it --rm --name ghostd_cuda -f Dockerfile.cuda -v ghost_cuda:/usr/src/app --net=host -p 8090:8090 -p 8091:8091 -p 50129:50129/udp -p 58080:58080 ghost_cuda


docker_clean:
	docker system prune --volumes