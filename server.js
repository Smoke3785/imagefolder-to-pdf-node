console.clear()
console.log('Image to PDF initialized')
const path = require('path')
const fs = require('fs')
const assert = require('assert')
const { PDFDocument } = require('pdf-lib');
const sharp = require('sharp')

// Determines if string == any string in blacklist array
const isIgnore =(n)=> ['.git','node_modules','output'].some((i) => n == i)

const index = async(x)=> {
    // Holds most recent manifest of files
    let objectArray = []
    // For each folder
    fs.readdirSync(path.resolve(__dirname, './')).forEach(async (data, idx)=>{
        var date, download, imageSpec
        date = `${data}`
        download = `pdf-doc-${date}`
        // Check if directory is folder or if it is blacklistted (.git, for example)
        if (!fs.statSync(path.resolve(`./${data}`)).isDirectory() || isIgnore(data)) return
        // Create a blank document
        let doc = await PDFDocument.create()
        //For each image in folder
        fs.readdirSync(path.resolve(__dirname, data)).forEach(async(image, idx)=> {
            // Test to see if image is .jpg
            if(image.slice(-3) !== 'jpg') return
            // Put thumbnail (first image in folder) in folder and save name
            if (idx == 0 && x == 1) {
                // Resizes the image to 10% of their original resolution for high-speed asset aquisition
                sharp(fs.readFileSync(path.resolve(__dirname, `${data}/${image}`))).resize({width: 235}).toBuffer().then(bufferData=> {
                    fs.writeFileSync(path.resolve(__dirname, `output/thumbnails/${data}-${image}`), bufferData)
                    imageSpec = `https://cdn.iliad.dev/public/production/bfjones/Images/yearbookThumbnails/${data}-${image}`
                    console.log(`Thumbnail image processed for ${data}`)
                })
            }
            // Add page
            let page = doc.addPage()
            // Load image
            let img = await doc.embedJpg(fs.readFileSync(path.resolve(__dirname, `${data}/${image}`)))
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
        fs.writeFileSync(path.resolve(__dirname, `${x == 1? 'output/documents' : data}/${data}-output.pdf`), final)
        objectArray.push({date, download, image: imageSpec, view: `https://cdn.iliad.dev/public/production/bfjones/PDF/yearbooks/${data}-output.pdf`})
        fs.writeFileSync(path.resolve(__dirname, `output/manifest.json`), JSON.stringify(objectArray), {encoding:'utf8', flag:'w'})
        console.log(`Finished with ${date}`)
    })
}

index(1)