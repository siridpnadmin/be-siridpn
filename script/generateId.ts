const { v4: uuidv4 } = require('uuid')

const uuids = []

for (let i = 0; i < 81; i++) {
  uuids.push(uuidv4())
}

console.log(uuids)
