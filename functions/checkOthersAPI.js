const sellersToIgnore = ['Buy-n-Play', 'Playtime']; // Ignora esses para subir o preço

function checkOthersAPI(responseData) {
    if (sellersToIgnore.includes(responseData[0].seller_name) && responseData[1].seller_name == 'CarcaDeals') { // Se estamos em segundo e o primeiro tem API insta
        
        const primeiro = responseData[0].retail_price; // API insta
        const segundo = responseData[1].retail_price; // Nós
        const terceiro = responseData[2].retail_price; // Preço que deve estar certo
        
        const dezPorcentoSegundo = segundo * 0.1; // Preço que deve estar certo
        
        const diferencaSegundoPrimeiro = segundo - primeiro;
        
        if(diferencaSegundoPrimeiro <= dezPorcentoSegundo){
            
            console.log('a diferença pro primeiro é menor');
            
            const dezPorcentoTerceiro = terceiro * 0.1; // Preço que deve estar certo
            
            const diferencaTerceiroSegundo = terceiro - segundo;
            // console.log(diferencaTerceiroSegundo);
            
            if(diferencaTerceiroSegundo >= dezPorcentoTerceiro){
                console.log('API identificada, bater o preço do terceiro');
                
                return terceiro - 0.02;
            }
        }  
    }
    return false;
}


module.exports = { checkOthersAPI };