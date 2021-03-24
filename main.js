const fetch = require('node-fetch')
const url = 'http://norvig.com/big.txt';
const apiKey = `dict.1.1.20210216T114936Z.e4989dccd61b9626.373cddfbfb8a3b2ff30a03392b4e0b076f14cff9`
const wordMeaningUrl = `https://dictionary.yandex.net/api/v1/dicservice.json/lookup?lang=en-uk&key=${apiKey}&text=`

fetch(url)
    .then(res => res.text())
    .then(text =>  {
        const occurences = getTopOccurrences(text)
        console.log(occurences)

        const wordMeaningPromises = occurences.map(occ => getWordMeaning(occ))

        Promise.all(wordMeaningPromises)
            .then(wordMeaningObj => {
                console.log(JSON.stringify(wordMeaningObj))
            })
    })

function getTopOccurrences(text){
    const wordArray = text.replace(/\n/g,' ').replace(/[0-9]/g,' ').split(' ');
    const occ = {}

    wordArray.forEach(word => {
        if(!word.length) return

        const plainWord = word.replace(/["!,.]/g, "")
        // console.log(plainWord)

        if(plainWord in occ) occ[plainWord] = occ[plainWord] + 1
        else occ[plainWord] = 0
    });

    const occArray = Object.entries(occ).sort(([k1, v1], [k2, v2]) => v2 - v1)
    occArray.length = 10
    
    return occArray
}


function getWordMeaning(wordEntry){
    const [word, count] = wordEntry
    return new Promise((resolve, reject) => {
        fetch(wordMeaningUrl + word)
        .then(res => res.json())
        .then(json => {
            const syns = []
            const defArr = json['def']
            const obj = {
                text: word,
                output: []
            }

            if(!defArr.length) {
                obj.output.push({occurences: count})
            } else {
                defArr.forEach(data => {
                    const {text, pos, tr} = data
    
                    tr && tr.length && tr.forEach(trans => {
                        if('syn' in trans){
                            syn.length && syn.forEach(syno => {
                                syns.push(syno.text)
                            })
                        }
                    })
    
                    const op = {
                        pos,
                        occurences: count,
                        synonyms: syns
                    }
    
                    obj.output.push(op)
                })
            } 

            resolve(obj)
        })
        .catch(err => reject(err))
    })
}


