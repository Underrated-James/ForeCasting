export function preprocessDate(data) {
    return data.map((row, index) => {
      if (row.sales_date && typeof row.sales_date === "string") {
        const dateMatch = row.sales_date.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
        if (dateMatch) {
          let [_, day, month, year] = dateMatch;
          day = day.padStart(2, "0");
          month = month.padStart(2, "0");
          const timestamp = new Date(`${year}-${month}-${day}`).getTime();
          return {
            ...row,
            sales_date: timestamp,
          };
        } else {
          console.warn(`Invalid sales_date format at row ${index + 1}: ${row.sales_date}`);
          return { ...row, sales_date: null };
        }
      } else {
        console.warn(`Missing or invalid sales_date at row ${index + 1}: ${row.sales_date}`);
        return { ...row, sales_date: null };
      }
    });
  }
  
  export function oneHotEncodeProductDescriptions(data) {
    const productDescriptions = [...new Set(data.map(item => item.product_description))];
    const productMap = productDescriptions.reduce((acc, description, index) => {
      acc[description] = index;
      return acc;
    }, {});
  
    return data.map(row => {
      const encoded = new Array(productDescriptions.length).fill(0);
      if (row.product_description) {
        encoded[productMap[row.product_description]] = 1;
      } else {
        console.warn(`Missing product_description: ${row.product_description}`);
      }
      return {
        ...row,
        product_description: encoded,
      };
    });
  }
  
  export function normalizeQuantities(data) {
    const validQuantities = data.map(row => row.quantity_sold).filter(qty => qty != null && !isNaN(qty));
    if (validQuantities.length === 0) {
      console.warn("No valid quantities found for normalization.");
      return data;
    }
  
    const min = Math.min(...validQuantities);
    const max = Math.max(...validQuantities);
    if (min === max) {
      console.warn("All quantities are the same; normalization is not possible.");
      return data.map(row => ({
        ...row,
        quantity_sold: row.quantity_sold != null ? 1 : null,
      }));
    }
  
    return data.map(row => ({
      ...row,
      quantity_sold: row.quantity_sold != null ? (row.quantity_sold - min) / (max - min) : null,
    }));
  }
  
  export function preprocessData(rawData) {
    if (!Array.isArray(rawData) || rawData.length === 0) {
      console.error("Invalid or empty raw data.");
      return [];
    }
  
    console.log("Starting preprocessing with raw data:", rawData);
  
    let data = preprocessDate(rawData);
    data = oneHotEncodeProductDescriptions(data);
    data = normalizeQuantities(data);
    data = data.filter(row => row.sales_date != null && row.product_description != null && row.quantity_sold != null);
  
    console.log("Completed preprocessing. Final processed data:", data);
  
    return data;
  }
  