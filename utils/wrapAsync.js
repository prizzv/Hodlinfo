// export default func => {
//     return (req, res, next) => {
//         func(req, res, next).catch(e => next(e))
//     }
// }

module.exports = func => {
    return (req, res, next) => {
        func(req, res, next).catch(e => next(e))
    }
}