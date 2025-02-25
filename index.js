const btns = document.querySelectorAll(".btn");
const prblm = document.querySelector("#calculation-prblm")
const soln = document.querySelector("#calculation-soln")


const factorial = (n)=>{
    if(n===0 || n=== 1){
        return 1;
    }else{
        return factorial(n-1)*n;
    }
};

const replacer=(str)=>{
    return str.replaceAll("%","*0.01").replaceAll("x","*").replaceAll("^","**").replaceAll().replaceAll("÷","/").replaceAll("sin(","Math.sin(").replaceAll("cos(","Math.cos(").replaceAll("tan(","Math.tan(").replaceAll("deg","*(Math.PI/180)")
    .replaceAll(/(\d+)(𝝿)/g, (match, number) => {
        return `${parseInt(number) * Math.PI}`;
    }).replaceAll("𝝿","Math.PI")
    .replaceAll(/(\d+)(!)/g, (match, number) => {
        return `${factorial(parseInt(number))}`;
    }).replaceAll(/(\d+)(rad)/g, (match, number) => {
        return `${parseInt(number) * 180/Math.PI}`;
    }).replaceAll(/(\d*)√(\d+)/g, (match, coefficient, number) => {
        if (coefficient) {
          return `${coefficient}*(${number}**(1/2))`;
        } else {
          return `(${number}**1/2)`;
        }
      })
}

const handleBTS=(prblm)=>{
    prblmCopy = replacer(prblm)
    let l = prblm.length;
    console.log(prblmCopy)
    l>0?soln.value=eval(prblmCopy):soln.value=""
}

btns.forEach(btn => {
    btn.addEventListener("click", (e)=>{
        let id = btn.getAttribute("id");
        if(id==="delete"){
            prblm.value=prblm.value.substring(0, prblm.value.length-1)
        }else if (id==="reset"){
            prblm.value=""
        }else if(id==="equals"){
            prblm.value+=""
        }
        else if(id==="sin"||id==="cos" || id==="tan"){
            prblm.value+=btn.textContent+"("
        }else(prblm.value+=btn.textContent);

        handleBTS(prblm.value)
    })
});


  