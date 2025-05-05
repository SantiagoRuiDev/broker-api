import { ISettlement, ISettlementExport } from "../interfaces/settlement.interface";

export function getLiquidationTemplate(settlements: ISettlementExport) {
  const rows = settlements.clientes.map((c) => {
    return `<tr>
    <th style="background-color: #f2f2f2; padding: 10px;">Nombre y Apellido:</th>
    <td style="border: 1px solid #dddddd; padding: 10px;">${c}</td>
    </tr>`;
  });

  return (
    `
        <!DOCTYPE html>
  <html>
  
  <head>
      <meta charset="UTF-8">
      <title>Negocios pendientes</title>
      <meta charset="UTF-8">
      <link rel="preconnect" href="https://fonts.googleapis.com">
      <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
      <link href="https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap" rel="stylesheet">
  </head>
  
  <div class="order-template" style="width: 100%; font-family: 'Arial', sans-serif; display: grid; gap: 25px;">
    <h2 style="color: #333333; text-align: center; margin: 0px auto;">Recuerde gestionar estos pendientes de sus clientes para que pueda cobrar sus comisiones</h2>
    <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 14px;"><!-- Información del vendedor -->
    <tbody>
    <tr>
    <td style="border: 1px solid #dddddd; padding: 0;">
    <table style="width: 100%; border-collapse: collapse;">
    <tbody>
    ` +
    rows +
    `
    </tbody>
    </table>
    </td>
    </tr>
    </tbody>
    </table>
    </div>
    
  </html>
  
  <style>
      .order-template {
          display: grid;
          place-content: center;
          justify-content: center;
      }
      * {
          font-family: "Poppins", sans-serif;
          font-weight: 400;
          font-style: normal;
      }
  
      .order-image {
          max-height: 250px;
          top: 72px;
          justify-self: center;
          margin: 0px auto;
      }
  
      h1 {
          font-size: 24px;
          margin-bottom: 20px;
      }
  
      th {
          font-weight: bold;
          text-align: left;
      }
  
      td {
          padding: 8px;
      }
  </style>
      `
  );
}

/*

const options = {
      format: "A4",
      orientation: "portrait",
    };

    // Generar el PDF
    PDF.create(getOrderTemplate(order), options).toBuffer((err, buffer) => {
      if (err) {
        res.status(500).send("Error al generar el PDF");
        return;
      }

      // Enviar el PDF como una respuesta para su descarga
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        'attachment; filename="documento.pdf"'
      );
      return res.status(200).send(buffer);
    }); */
