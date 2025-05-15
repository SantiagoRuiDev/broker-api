import { ISettlementMapped } from "../interfaces/settlement.interface";

function formatUSD(value: number): string {
  return value.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  });
}

export function getPendingTemplate(settlements: ISettlementMapped[]) {
  const fee = settlements[0].Subagente?.tarifa_comision || 0;
  const rows = settlements.map((c) => {
    return `<tr>
    <td>${c.Aseguradora?.nombre}</td>
    <td>${c.factura}</td>
    <td>${c.poliza}</td>
    <td>${c.endoso}</td>
    <td>${c.Cliente?.nombre}</td>
    <td>${formatUSD(c.valor_prima || 0)}</td>
    <td>${formatUSD(c.comision || 0)}</td>
    <td>${formatUSD(((c.comision || 0) * fee) / 100)}</td>
  </tr>`;
  });

  return (
    `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Liquidación - Ciaros S.A.</title>
  <style>
    * {
  box-sizing: border-box;
}
    .datatable, .wide-summary {
  page-break-inside: avoid;
}
@page {
  margin: 0;
}

html, body {
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;
}
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      margin: 0;
      padding: 20px;
      color: #333;
      background-color: #f9f9f9;
    }
    header, footer {
      font-size: 12px;
      color: #555;
    }

    header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid #ccc;
      padding-bottom: 10px;
      margin-bottom: 20px;
    }

  td {
  word-break: break-word;
}

    .logo img {
      max-width: 150px;
      border-radius: 8px;
    }

    .title {
      text-align: center;
      font-size: 22px;
      font-weight: bold;
      margin-bottom: 20px;
      color: #2c3e50;
    }

    .section-two-columns {
      display: flex;
      justify-content: space-between;
      margin-bottom: 25px;
      font-size: 13px;
    }

    .column {
      width: 48%;
      background-color: #fff;
      padding: 12px;
      border-radius: 8px;
      box-shadow: 0 2px 6px rgba(0,0,0,0.05);
    }

    .column div {
      margin-bottom: 6px;
    }


    .datatable {
      width: 100%;
      border-collapse: separate;
      border-spacing: 0;
      background-color: #fff;
      box-shadow: 0 2px 6px rgba(0,0,0,0.1);
      border-radius: 8px;
      overflow: hidden;
      font-size: 13px;
      margin-bottom: 30px;
    }

    .datatable th, .datatable td {
      padding: 10px;
      text-align: center;
    }

    .datatable thead {
      background-color: #2c3e50;
      color: #fff;
    }

    .datatable tbody tr:nth-child(even) {
      background-color: #f2f6fa;
    }

    .datatable tbody tr:hover {
      background-color: #e3edf7;
    }

    .wide-summary {
      background-color: #fff;
      padding: 15px;
      border-radius: 8px;
      box-shadow: 0 2px 6px rgba(0,0,0,0.05);
      font-size: 13px;
      margin-bottom: 30px;
    }

    .wide-summary div {
      margin-bottom: 6px;
    }

    footer {
      border-top: 1px solid #ccc;
      padding-top: 10px;
      text-align: center;
    }

    .footer-contact div {
      margin: 3px 0;
    }
   
  </style>
</head>
<body>
  <header>
    <div>
      <strong>Ciaros S.A.</strong>
    </div>
    <div class="header-contact">
      <div>Email: contacto@ciaros.com</div>
      <div>Tel: +593 7 456 7890</div>
      <div>Dirección: Calle Ejemplo 456, Guayaquil, Ecuador</div>
    </div>
  </header>

  <div class="title">Recuerde gestionar estos pendientes de sus clientes para que pueda cobrar 
sus comisiones</div>

  <div class="logo" style="text-align: center; margin-bottom: 20px;">
    <img src="https://i.imgur.com/njPPBti.png" alt="Logo">
  </div>


  <table class="datatable">
    <thead>
      <tr>
        <th>Aseguradora</th>
        <th>Factura</th>
        <th>Ramo-Poliza</th>
        <th>Negocio</th>
        <th>Cliente</th>
        <th>Prima Neta</th>
        <th>Comisión Ciaros</th>
        <th>Comisión Subagente</th>
      </tr>
    </thead>
    <tbody>
  ${rows.join("")}
    </tbody>
  </table>


  <footer>
    <div class="footer-contact">
      <div>Ciaros S.A. - Todos los derechos reservados © 2025</div>
      <div>www.ciaros.com | contacto@ciaros.com | +593 7 456 7890</div>
    </div>
  </footer>

</body>
</html>`
  );
}
