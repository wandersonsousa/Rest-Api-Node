function getCurrentTime(){
    let date = new Date()
    let dateStr = new Date().toString().split(' ')
    let month = date.getMonth() < 10? `0${date.getMonth() + 1}`:date.getMonth() + 1

    const currentDate = `${dateStr[2]}/${month}/${dateStr[3]}`
    const currentTime = dateStr[4]

    return {
        currentDate:currentDate,
        currentTime:currentTime
    }
}

function generateId( products, maxWidth = 999999999 ){
    let id = Math.floor( Math.random() * maxWidth );
    let [hasIdInProduct] = products.filter( product => product.id === id );
    return hasIdInProduct?generateId( products ):id;
}


module.exports = {
    generateId,
    getCurrentTime
}