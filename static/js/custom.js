// Global State
let productsList = [];
let orderItems = [];
let currentOrderData = null; // Store data for current order being viewed

// --- Utils ---
const formatCurrency = (amount) => {
    return parseFloat(amount).toFixed(2);
};

const formatOrderId = (id) => {
    return 'R' + id.toString().padStart(4, '0');
};

const formatDate = (dt) => {
    return new Date(dt).toLocaleString();
};

const showAlert = (type, message) => {
    const alertDiv = document.querySelector('.alert');
    if (alertDiv) {
        alertDiv.textContent = message;
        alertDiv.className = `alert ${type}`;
        alertDiv.style.display = 'block';
        setTimeout(() => {
            alertDiv.style.display = 'none';
        }, 3000);
    } else {
        alert(message);
    }
};

const closeModal = (id) => {
    document.getElementById(id).classList.remove('show');
};

const openModal = (id) => {
    document.getElementById(id).classList.add('show');
};

// --- Product Logic ---
async function fetchProducts() {
    try {
        const response = await fetch('/getProducts');
        const data = await response.json();
        productsList = data;
        return data;
    } catch (error) {
        console.error('Error fetching products:', error);
        return [];
    }
}

async function loadProducts() {
    const products = await fetchProducts();
    const tbody = document.getElementById('products-table-body');
    tbody.innerHTML = '';

    products.forEach(p => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${p.name}</td>
            <td>${p.uom_name}</td>
            <td>₹${formatCurrency(p.price_per_unit)}</td>
            <td>
                <button class="btn btn-edit btn-sm" onclick="openEditProduct(${p.product_id})">Edit</button>
                <button class="btn btn-danger btn-sm" onclick="deleteProduct(${p.product_id})">Delete</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// function openAddModal() { } // Removed

function openEditProduct(id) {
    const product = productsList.find(p => p.product_id == id);
    if (product) {
        document.getElementById('editProductId').value = product.product_id;
        document.getElementById('editProductName').value = product.name;
        document.getElementById('editUomSelect').value = product.uom_id;
        document.getElementById('editProductPrice').value = product.price_per_unit;
        // document.getElementById('modalTitle').textContent = 'Edit Product'; // Static now
        openModal('productModal');
    }
}

async function handleProductSubmit(e) {
    e.preventDefault();
    // Inline Add Product
    const data = {
        name: document.getElementById('productName').value,
        uom_id: document.getElementById('uomSelect').value,
        price_per_unit: document.getElementById('productPrice').value
    };

    try {
        const res = await fetch('/insertProduct', { method: 'POST', body: createFormData(data) });
        const result = await res.json();
        document.getElementById('productForm').reset();
        loadProducts();
    } catch (error) {
        console.error('Error saving product:', error);
    }
}

async function handleEditProductSubmit(e) {
    e.preventDefault();
    const id = document.getElementById('editProductId').value;
    const data = {
        name: document.getElementById('editProductName').value,
        uom_id: document.getElementById('editUomSelect').value,
        price_per_unit: document.getElementById('editProductPrice').value
    };

    try {
        const formData = createFormData(data);
        formData.append('product_id', id);

        await fetch('/editProduct', { method: 'POST', body: formData });
        closeModal('productModal');
        loadProducts();
    } catch (error) {
        console.error('Error updating product:', error);
    }
}

function createFormData(data) {
    const formData = new FormData();
    formData.append('data', JSON.stringify(data));
    return formData;
}

async function deleteProduct(id) {
    if (confirm('Are you sure you want to delete this product?')) {
        const formData = new FormData();
        formData.append('product_id', id);
        await fetch('/deleteProduct', { method: 'POST', body: formData });
        loadProducts();
    }
}

// --- UOM Logic ---
async function loadUOMs() {
    try {
        const res = await fetch('/getUOMs');
        const data = await res.json();
        const select = document.getElementById('uomSelect');
        if (select) {
            const options = data.map(u => `<option value="${u.uom_id}">${u.uom_name}</option>`).join('');
            select.innerHTML = options;

            // Also populate edit select if exists
            const editSelect = document.getElementById('editUomSelect');
            if (editSelect) editSelect.innerHTML = options;
        }
    } catch (e) { console.error(e); }
}

function openUOMModal() {
    openModal('uomModal');
}

async function handleUOMSubmit(e) {
    e.preventDefault();
    const name = document.getElementById('uomName').value;
    const formData = new FormData();
    formData.append('data', JSON.stringify({ uom_name: name }));

    await fetch('/insertUOM', { method: 'POST', body: formData });
    closeModal('uomModal');
    loadUOMs();
}

// --- Order Logic ---
function addOrderItem() {
    const container = document.getElementById('orderItems');
    const index = container.children.length;

    const div = document.createElement('div');
    div.className = 'order-row';
    div.id = `row-${index}`;

    let options = '<option value="">Select Product...</option>';
    productsList.forEach(p => {
        options += `<option value="${p.product_id}" data-price="${p.price_per_unit}">${p.name}</option>`;
    });

    div.innerHTML = `
        <select class="form-control" onchange="updateItemPrice(${index})" id="product-${index}">
            ${options}
        </select>
        <input type="number" class="form-control" id="price-${index}" readonly>
        <input type="number" class="form-control" id="qty-${index}" oninput="updateItemTotal(${index})" min="1" value="1">
        <input type="number" class="form-control" id="total-${index}" readonly value="0.00">
        <button type="button" class="btn btn-danger btn-sm" onclick="removeOrderItem(${index})">&times;</button>
    `;

    container.appendChild(div);
}

function removeOrderItem(index) {
    const row = document.getElementById(`row-${index}`);
    row.remove();
    calculateGrandTotal();
}

function updateItemPrice(index) {
    const select = document.getElementById(`product-${index}`);
    const priceInput = document.getElementById(`price-${index}`);
    const selectedOption = select.options[select.selectedIndex];
    const price = selectedOption.getAttribute('data-price');

    priceInput.value = price || '';
    updateItemTotal(index);
}

function updateItemTotal(index) {
    const price = parseFloat(document.getElementById(`price-${index}`).value) || 0;
    const qty = parseFloat(document.getElementById(`qty-${index}`).value) || 0;
    const total = price * qty;

    document.getElementById(`total-${index}`).value = total.toFixed(2);
    // Explicitly update total price bug fix: always recalc grand total
    calculateGrandTotal();
}

function calculateGrandTotal() {
    let grandTotal = 0;
    const totals = document.querySelectorAll('[id^=total-]');
    totals.forEach(input => {
        grandTotal += parseFloat(input.value) || 0;
    });
    document.getElementById('grandTotal').textContent = formatCurrency(grandTotal);
}

async function submitOrder() {
    // Validation
    const customer = document.getElementById('customerName').value;
    if (!customer.trim()) {
        showAlert('error', 'Please enter a customer name');
        return;
    }

    const orderDetails = [];
    const rows = document.querySelectorAll('.order-row');
    if (rows.length === 0) {
        showAlert('error', 'Please add at least one product');
        return;
    }

    let hasErrors = false;
    rows.forEach(row => {
        const index = row.id.split('-')[1];
        const productId = document.getElementById(`product-${index}`).value;
        const qty = parseFloat(document.getElementById(`qty-${index}`).value);
        const price = parseFloat(document.getElementById(`price-${index}`).value);
        const total = parseFloat(document.getElementById(`total-${index}`).value);

        if (!productId || qty <= 0) {
            hasErrors = true;
        }

        orderDetails.push({
            product_id: productId,
            quantity: qty,
            total_price: total
        });
    });

    if (hasErrors) {
        showAlert('error', 'Invalid product or quantity in order items');
        return;
    }

    const grandTotalValue = parseFloat(document.getElementById('grandTotal').textContent);

    const requestData = {
        customer_name: customer,
        grand_total: grandTotalValue,
        order_details: orderDetails
    };

    const formData = new FormData();
    formData.append('data', JSON.stringify(requestData));

    try {
        const res = await fetch('/insertOrder', { method: 'POST', body: formData });
        const result = await res.json();

        // Success Notification
        showAlert('success', `Order placed successfully! Order ID: ${formatOrderId(result.order_id)}. Total: ₹${formatCurrency(grandTotalValue)} 
            <button class="btn btn-secondary btn-sm" style="margin-left: 1rem;" onclick="viewOrderDetails(${result.order_id})">View/Print Receipt</button>`);

        // Reset form
        document.getElementById('orderForm').reset();
        document.getElementById('orderItems').innerHTML = '';
        document.getElementById('grandTotal').textContent = '0.00';
        addOrderItem(); // Reset to one empty row
    } catch (e) {
        showAlert('error', 'Failed to place order');
    }
}

// --- Dashboard Logic ---
async function loadOrders() {
    try {
        const res = await fetch('/getAllOrders');
        const orders = await res.json();

        const tbody = document.getElementById('orders-table-body');
        if (tbody) {
            tbody.innerHTML = '';
            orders.forEach(o => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${formatOrderId(o.order_id)}</td>
                    <td>${o.datetime}</td>
                    <td>${o.customer_name}</td>
                    <td>₹${formatCurrency(o.total)}</td>
                    <td><button class="btn btn-primary btn-sm" onclick="viewOrderDetails(${o.order_id})">View</button></td>
                `;
                tbody.appendChild(tr);
            });
        }

        // Simple stats
        if (document.getElementById('totalOrdersCount')) {
            document.getElementById('totalOrdersCount').textContent = orders.length;
            const totalRev = orders.reduce((acc, o) => acc + o.total, 0);
            document.getElementById('totalRevenue').textContent = formatCurrency(totalRev);
        }

    } catch (e) { console.error(e); }
}

async function viewOrderDetails(orderId) {
    try {
        const res = await fetch(`/getOrderDetails?order_id=${orderId}`);
        const details = await res.json();
        
        // Find order basic info from dashboard table or better: fetch it
        // For now, let's assume we can get customer/date from the row or re-fetch
        // Let's re-fetch all orders to find this one's basic info
        const ordersRes = await fetch('/getAllOrders');
        const allOrders = await ordersRes.json();
        const basicInfo = allOrders.find(o => o.order_id == orderId);

        currentOrderData = {
            id: orderId,
            customer: basicInfo.customer_name,
            date: basicInfo.datetime,
            items: details,
            total: basicInfo.total
        };

        const tbody = document.getElementById('order-details-body');
        tbody.innerHTML = '';
        let total = 0;

        details.forEach(d => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${d.product_name || 'Unknown Product'}</td>
                <td>${d.price_per_unit ? '₹' + formatCurrency(d.price_per_unit) : '-'}</td>
                <td>${d.quantity}</td>
                <td>₹${formatCurrency(d.total_price)}</td>
            `;
            tbody.appendChild(tr);
            total += d.total_price;
        });

        document.getElementById('orderDetailTitle').textContent = `Order #${formatOrderId(orderId)}`;
        document.getElementById('orderDetailTotal').textContent = formatCurrency(total);
        openModal('orderDetailsModal');
    } catch (e) { console.error(e); }
}

function generateReceiptHTML(data) {
    let itemsHTML = '';
    data.items.forEach(item => {
        itemsHTML += `
            <tr>
                <td>${item.product_name || 'Unknown Product'}</td>
                <td>${item.quantity}</td>
                <td>₹${formatCurrency(item.total_price)}</td>
            </tr>
        `;
    });

    return `
        <div class="receipt-header">
            <h1 style="margin:0; font-size:1.5rem;">GROCERY MANAGER</h1>
            <p style="margin:0.25rem 0;">123 Street, City, Country</p>
            <p style="margin:0;">Contact: +1 234 567 890</p>
        </div>
        <div style="margin-bottom: 1.5rem;">
            <p><strong>Order ID:</strong> ${formatOrderId(data.id)}</p>
            <p><strong>Customer:</strong> ${data.customer}</p>
            <p><strong>Date:</strong> ${formatDate(data.date)}</p>
        </div>
        <table class="receipt-table">
            <thead>
                <tr>
                    <th>Item</th>
                    <th>Qty</th>
                    <th>Total</th>
                </tr>
            </thead>
            <tbody>
                ${itemsHTML}
            </tbody>
        </table>
        <div class="receipt-footer">
            <p style="font-size: 1.25rem;"><strong>Grand Total: ₹${formatCurrency(data.total)}</strong></p>
            <p style="margin-top: 2rem; text-align: center; border-top: 1px dotted #000; padding-top: 1rem;">
                Thank you for shopping with us!
            </p>
        </div>
    `;
}

function printReceipt() {
    if (!currentOrderData) return;
    const printArea = document.getElementById('receipt-print-area');
    printArea.innerHTML = generateReceiptHTML(currentOrderData);
    window.print();
}

function downloadPDF() {
    if (!currentOrderData) return;
    const printArea = document.getElementById('receipt-print-area');
    printArea.innerHTML = generateReceiptHTML(currentOrderData);
    
    const element = printArea;
    const opt = {
        margin:       0.5,
        filename:     `Receipt_${formatOrderId(currentOrderData.id)}.pdf`,
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2 },
        jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
    };

    // New Promise-based usage:
    html2pdf().set(opt).from(element).save();
}
