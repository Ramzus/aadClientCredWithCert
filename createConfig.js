// Used to create config, otherwise manually fill nodeconfig.json

const {generateConfig} =require('./helpers/configGenerator')

var appid = '2814bb41-4ef8-45cb-bb3e-9748753875e3'
var tenantId = 'a3c8d0af-358c-4fed-b0bf-73679c851aa0'


//Generate Configuration
generateConfig(appid,tenantId)
.then((config) => console.log(config))
.catch((error) => console.log(error))
