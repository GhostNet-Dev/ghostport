
function getUnixTick(){
    return Math.floor(new Date().getTime() / 1000);
}


export { getUnixTick };