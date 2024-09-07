export let randomString = (n)=>{
    let charset = 'ajbc8989hkwmcncjdjwyqt114eifkncbv2525suifmlg3569ljlopgj0980bvsgdjnvjv'
    let string = ''
    let charsetLength = charset.length
    for(let i = 0;i<n;i++){
        string+=charset[(Math.floor(Math.random()*100)% charsetLength)]
    }
    return string
}
