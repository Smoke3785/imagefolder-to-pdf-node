console.clear()
console.log('Image to PDF initialized')
const path = require('path')
const fs = require('fs')
const assert = require('assert')
const { PDFDocument } = require('pdf-lib');

// C:\Users\owenr\Documents\GitHub\BF-Jones-Content-React\server\Collections\Yearbooks
const isIgnore =(n)=> ['.git'].some((i) => n == i)

const index = async()=> {
    // For each folder
    fs.readdirSync(path.resolve(__dirname, './')).forEach(async (data, idx)=>{
        console.log(data)
        // Check if directory is folder or if it is blacklistted (.git, for example)
        if (!fs.statSync(path.resolve(`./${data}`)).isDirectory() || isIgnore(data)) return
        // Create a blank document
        let doc = await PDFDocument.create()
        //For each image in folder
        fs.readdirSync(path.resolve(__dirname, data)).forEach(async(image, idx)=> {
            // Test to see if image is .jpg
            if(image.slice(-3) !== 'jpg') return
            console.log(image)
            // Add page
            let page = doc.addPage()
            // Load image
            let img = await doc.embedJpg(fs.readFileSync(path.resolve(__dirname, `${data}/${image}`)))
            // console.log(path.resolve(__dirname, `${data}/${image}`) )
            // Draw image on page
            page.drawImage(img, {
                x: 0,
                y: 0,
                width: page.getWidth(),
                height: page.getHeight()
              });
            //Convert image to pdf
        })
        const final = await doc.save()
        fs.writeFileSync(path.resolve(__dirname, `${data}/${data}-output.pdf`), final)
    })

}
index()