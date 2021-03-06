let axios = require('axios')
const uuid = require('uuid')
const {
    verify,
    sign,
} = require('jsonwebtoken')
const qs = require('querystring')

const axiosLogger = require('axios-logger');

let instance = axios.create();
instance.interceptors.request.use(axiosLogger.requestLogger);
instance.interceptors.response.use(axiosLogger.responseLogger);

function createToken(config, pub, priv, debug) {
    return new Promise((resolve, reject) => {

        var {
            appid,
            tenantId,
            x5t,
            passphrase
        } = config

        var privatekey = passphrase ? {key: priv, passphrase: passphrase} : priv;

        var claims = {
            "aud": `https://sts.windows.net/${tenantId}/`,
            "iss": appid,
            "sub": appid
        }

        claims.jti = uuid.v4()
        claims.exp = Math.floor(Date.now() / 1000) + (60 * 60)

        sign(claims, privatekey, {
            algorithm: 'RS256',
            header: {
                x5t,
            }
        }, (err, jwt) => {

            if (err) {
                return reject(err)
            }

            if (debug) {

                verify(jwt, pub, {
                    complete: true
                }, (err, decoded) => {
                    if (err) {
                        return reject(err)
                    }
                })
                reject(err)
                console.log(err)
                console.log('tokens', jwt);

            } else {
                resolve(jwt)
            }

        })

    })
}

async function getAADtokenWithCert(config, token) {

    return new Promise((resolve, reject) => {

        var {
            appid,
            url
        } = config


        var options = {
            responseType: 'json',
            "method": "post",
            url,
            data: qs.stringify({
                grant_type: "client_credentials",
                client_assertion_type: "urn:ietf:params:oauth:client-assertion-type:jwt-bearer",
                client_id: appid,
                client_assertion: token,
                resource: appid
            })
        }

        //console.log(options)

        instance(options).then(({
                                    data
                                }) => {
            resolve(data)
        }).catch(({response}) => {
            console.log(response)
            reject(response.data)
        })


    })


}


module.exports = {
    getAADtokenWithCert,
    createToken
}
