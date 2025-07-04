import { IAgent } from "../interfaces/agent.interface";
import { ISettlementMapped } from "../interfaces/settlement.interface";

function formatUSD(value: number): string {
  return value.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  });
}

const calcContribution = (
  payouts: any[],
  fee: number,
  contribution: number
) => {
  let total = 0;
  for (const payout of payouts) {
    if (payout.comision && payout.comision > 0) {
      total += (payout.comision || 0) * (fee / 100);
    }
  }
  return total * contribution * 1;
};

const calcIva = (subtotal: number, iva: number) => {
  return (subtotal * iva) / 100;
};

const calcIvaRetention = (
  subtotal: number,
  iva: number,
  iva_retention: number
) => {
  return (calcIva(subtotal, iva) * iva_retention) / 100;
};

const calcRent = (subtotal: number, rent: number) => {
  return (subtotal * rent) / 100;
};

const calcSubtotal = (payouts: any[], fee: number, contribution: number) => {
  let total = 0;
  for (const payout of payouts) {
    total += (payout.comision || 0) * (fee / 100);
  }
  return total - calcContribution(payouts, fee, contribution);
};

function escapeHTML(str = "") {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export function getLiquidationTemplate(payouts: any[], agent: IAgent) {
  const iva = Number(payouts[0].Finalizada.iva) || 0;
  const ret_rent = Number(payouts[0].Finalizada.ret_renta) || 0;
  const ret_iva = Number(payouts[0].Finalizada.ret_iva) || 0;
  const contributon = 0.005;
  const fee = Number(payouts[0].Finalizada.tarifa_comision) || 0;
  const adm_fee = Number(payouts[0].Finalizada.gastos_adm) || 0;
  const loan = payouts[0].Finalizada.prestamo || 0;
  const total = payouts[0].Finalizada.total_liquidado || 0;

  const liquidation_date = payouts[0].Finalizada.fecha_liquidacion;
  const liquidation_number = String(
    payouts[0].Finalizada.numero_liquidacion
  ).split("/")[0];

  const rows = payouts.map((c: ISettlementMapped) => {
    return `<tr>
        <td>${escapeHTML(c.Aseguradora?.nombre)}</td>
        <td>${c.factura}</td>
        <td>${c.poliza}</td>
        <td>${c.endoso}</td>
        <td>${c.Cliente?.nombre}</td>
        <td>${formatUSD(c.valor_prima || 0)}</td>
        <td>${formatUSD(c.comision || 0)}</td>
        <td>${formatUSD(((c.comision || 0) * fee) / 100)}</td>
      </tr>`;
  });

  const subtotal = calcSubtotal(payouts, fee, contributon);

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Liquidación ${liquidation_number} - Ciaros S.A.</title>
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
      display: flex;
      justify-content: space-between;
    	align-items: end;
    }
    
    .subtotal-box {
    	width: 100%;
      border-radius: 12px;
      padding: 0px 0px 0px 16px;
      border: 2px solid #ccc;
    }
    .subtotal-box h1 {
    	font-size: 18px;
    }

    .wide-summary div {
      margin-bottom: 6px;
    }

    .summary-box {
    	width: 100%;
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
    <div>
        <div>Fecha: ${liquidation_date}</div>
        <div>Liquidación N°: ${liquidation_number}</div>
    </div>
    <div class="header-contact">
      <div>Email: contacto@ciaros.com</div>
      <div>Tel: +593 7 456 7890</div>
      <div>Dirección: Calle Ejemplo 456, Guayaquil, Ecuador</div>
    </div>
  </header>

  <div class="title">Liquidación</div>

  <div class="logo" style="text-align: center; margin-bottom: 20px;">
    <img src="https://i.imgur.com/njPPBti.png" alt="Logo">
  </div>

    <div class="section-two-columns">
    <div class="column">
        <div><strong>Nombre del Agente:</strong> ${agent.nombres}</div>
        <div><strong>Apellido del Agente:</strong> ${agent.apellidos}</div>
        <div><strong>Ciudad:</strong> ${agent.ciudad}</div>
        <div><strong>Regimen:</strong> ${agent.tipo_de_regimen}</div>
        <div><strong>Código:</strong> ${agent.codigo}</div>
    </div>
    <div class="column">
        <div><strong>IVA (%):</strong> ${iva}%</div>
        <div><strong>Retención IVA (%):</strong> ${ret_iva}%</div>
        <div><strong>Retención Renta (%):</strong> ${ret_rent}%</div>
        <div><strong>Comisión (%):</strong> ${fee}%</div>
    </div>
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

  <div class="wide-summary">
    <div class="summary-box">
      <div><strong>Contribución Supercias:</strong> ${formatUSD(
        calcContribution(payouts, fee, contributon)
      )}</div>
      <div><strong>Subtotal Comisión:</strong> ${formatUSD(subtotal)}</div>
      <div><strong>IVA:</strong> ${formatUSD(calcIva(subtotal, iva))}</div>
      <div><strong>Retención IVA:</strong> ${formatUSD(
        calcIvaRetention(subtotal, iva, ret_iva)
      )}</div>
      <div><strong>Retención Renta:</strong> ${formatUSD(
        calcRent(subtotal, ret_rent)
      )}</div>
      <div><strong>Comisión Bruta:</strong> ${formatUSD(
        subtotal - calcRent(subtotal, ret_rent)
      )}</div>
      <div><strong>Gastos Adm:</strong> ${formatUSD(adm_fee)}</div>
      <div><strong>Préstamos:</strong> ${formatUSD(loan)}</div>
      <div><strong>Total a Recibir:</strong> <strong style="color: green;">${formatUSD(
        total
      )}</strong></div>
    </div>
    <div class="subtotal-box">
      <h1>SUBTOTAL PARA FACTURAR: ${formatUSD(subtotal)}</h1>
    </div>
  </div>

  <footer>
    <div class="footer-contact">
      <div>Ciaros S.A. - Todos los derechos reservados © 2025</div>
      <div>www.ciaros.com | contacto@ciaros.com | +593 7 456 7890</div>
    </div>
  </footer>

</body>
</html>
`;
}
