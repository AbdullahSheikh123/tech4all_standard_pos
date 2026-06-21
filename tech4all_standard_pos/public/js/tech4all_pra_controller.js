class POSPRA {
    pra_host = null

    constructor() {
    }

    setPRAHost(pra_host = null) {
        if (!pra_host || pra_host === '') {
            pra_host = 'localhost'
        }
        this.pra_host = pra_host;
    }

    sendToPRA(invoice) {
        const date = new Date();
        invoice.DateTime = date.toString().slice(4, 15) + " " + date.toString().slice(16, 24);
        invoice.InvoiceNumber = ""
        let url = `http://${this.pra_host}:8524/api/IMSFiscal/GetInvoiceNumberByModel`
        return new Promise(function(resolve, reject) {
          $.ajax({
            url: url,
            type: "POST",
            data: JSON.stringify(invoice),
            dataType: 'json',
            cache: false,
            contentType: 'application/json; charset=utf-8',
            processData: false,
            success: function (data) {
                resolve(data)
            },
            error: function (data) {
                reject(data)
            }
        });
        })
    }
}
