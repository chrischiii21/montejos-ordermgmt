import{c as He}from"./index.Bfd5Thr0.js";const le=He("https://pmbbpxfchjxzatapzwyw.supabase.co","eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBtYmJweGZjaGp4emF0YXB6d3l3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA4NjczNTMsImV4cCI6MjA5NjQ0MzM1M30.vf-MGuB8gIa34H4DjUaoN-057D7lnQL3YCJd3ouVVng");function Q(t){return new Promise(e=>{const n=document.getElementById("confirm-modal-overlay"),i=document.getElementById("confirm-modal-message"),l=document.getElementById("confirm-ok-btn"),a=document.getElementById("confirm-cancel-btn"),r=document.getElementById("close-confirm-modal-btn");if(!n||!i||!l||!a)return e(!1);i.textContent=t||"Are you sure?",n.classList.add("active");const o=document.activeElement;l.focus();const d=m=>{m.key==="Escape"&&(m.preventDefault(),p()),m.key==="Enter"&&(m.preventDefault(),c())},s=m=>{m.target===n&&p()},u=()=>{n.classList.remove("active"),l.removeEventListener("click",c),a.removeEventListener("click",p),r?.removeEventListener("click",p),n.removeEventListener("click",s),document.removeEventListener("keydown",d);try{o?.focus()}catch{}},c=()=>{u(),e(!0)},p=()=>{u(),e(!1)};l.addEventListener("click",c),a.addEventListener("click",p),r?.addEventListener("click",p),n.addEventListener("click",s),document.addEventListener("keydown",d)})}const De={"Set A Lechon Package":["1 whole Lechon Baboy","1 tray Buttered Shrimps","100 pieces Lumpia Shanghai","1 tray Chicken Cordon Bleu","1 tray Special Bam-e","1 tray Diniguan","1 tray Spicy Buffalo Chicken"],"Set B Lechon Package":["1 whole Lechon Baboy","1 tray Buttered Shrimps","150 pieces Lumpia Shanghai","1 tray Chicken Cordon Bleu","1 tray Special Bam-e","1 tray Diniguan","1 tray Spicy Buffalo Chicken","1 tray Calamares"],"Set C Lechon Package":["1 whole Lechon Baboy","1 tray Buttered Shrimps","200 pieces Lumpia Shanghai","1 tray Chicken Cordon Bleu","1 tray Special Bam-e","1 tray Diniguan","1 tray Spicy Buffalo Chicken","1 tray Calamares","1 tray Chicken Guisado"],"P1 Package (Bilao)":["1 whole Lechon Manok","30 pieces Pork Lumpia","10 pieces Battered Chicken","1/2 kilo Buttered Shrimps","25 pieces Calamares","Half tray Special Bam-i","1 tray Chosen Dessert"],"P2 Package (Bilao)":["3 kilos Lechon Belly","30 pieces Pork Lumpia","10 pieces Battered Chicken","1/2 kilo Buttered Shrimps","25 pieces Calamares","Half tray Special Bam-i","1 tray Chosen Dessert"],"P3 Package (Bilao)":["4 kilos Lechon Belly","40 pieces Pork Lumpia","15 pieces Battered Chicken","10 pieces Buffalo / Teriyaki Chicken","3/4 kilo Buttered Shrimps","40 pieces Calamares","1 tray Special Bam-i","1 tray Chosen Dessert"],"P4 Package (Bilao)":["5 kilos Lechon Belly","50 pieces Pork Lumpia","20 pieces Battered Chicken","15 pieces Buffalo / Teriyaki Chicken","3/4 kilo Buttered Shrimps","50 pieces Calamares","1 tray Special Bam-i","1 tray Chosen Dessert"],"P5 Package (Bilao)":["6 kilos Lechon Belly","70 pieces Pork Lumpia","25 pieces Battered Chicken","20 pieces Buffalo / Teriyaki Chicken","1 kilo Buttered Shrimps","60 pieces Calamares","1 tray Special Bam-i","1 tray Chosen Dessert"],"P6 Package (Bilao)":["7 kilos Lechon Belly","80 pieces Pork Lumpia","30 pieces Battered Chicken","25 pieces Buffalo / Teriyaki Chicken","1 kilo Buttered Shrimps","70 pieces Calamares","1 tray Special Bam-i","1 tray Chosen Dessert"]};function Fe(t){for(const e in De)if(t.toLowerCase().includes(e.toLowerCase())||e.startsWith("P")&&t.toLowerCase().includes(e.toLowerCase().split(" ")[0]+" package"))return[...De[e]];return null}let b=[],he="All",ke="",N=[],se="Owner",Z="Pickup";function Re(t){return{id:t.id,date:t.date,customer:t.customer,address:t.address,contact:t.contact,deliveryDateTime:t.delivery_date_time??"",fulfillmentType:t.fulfillment_type??"Delivery",status:t.status,total:parseFloat(t.total),downpayment:parseFloat(t.downpayment),balance:parseFloat(t.balance),deliveryFee:parseFloat(t.delivery_fee??0),items:(t.order_items??[]).map(e=>({name:e.name,quantity:e.quantity,price:parseFloat(e.price),total:parseFloat(e.total),customInclusions:e.custom_inclusions??[]}))}}function Ue(t){if(t.status==="Completed"||t.status==="Cancelled")return t.status;const e=t.deliveryDateTime;if(!e)return t.status;const n=new Date(e.replace(" ","T"));if(isNaN(n.getTime()))return t.status;const i=new Date,a=(n.getTime()-i.getTime())/(1e3*60*60);let r=t.status;return i>=n?r="Completed":a<=4&&(r="Preparing"),r!==t.status&&(t.status=r,le.from("orders").update({status:r}).eq("id",t.id).then(({error:o})=>{o?console.error(`Error auto-updating status for ${t.id}:`,o.message):console.log(`Auto-updated order ${t.id} status to ${r} based on schedule.`)})),r}async function qe(){const{data:t,error:e}=await le.from("orders").select("*, order_items(*)").order("created_at",{ascending:!1});if(e){console.error("Error loading orders:",e.message);return}b=(t??[]).map(Re),b.forEach(Ue)}document.addEventListener("DOMContentLoaded",async()=>{Ve(),await qe(),j(),Ye(),at(),lt();const t=document.getElementById("mobile-menu-btn"),e=document.querySelector(".sidebar"),n=document.getElementById("sidebar-overlay");t&&e&&n&&(t.addEventListener("click",()=>{e.classList.add("active"),n.classList.add("active")}),n.addEventListener("click",()=>{e.classList.remove("active"),n.classList.remove("active")}),e.querySelectorAll(".nav-item").forEach(i=>{i.addEventListener("click",()=>{e.classList.remove("active"),n.classList.remove("active")})}))});function Ve(){const t=document.getElementById("current-date");if(t){const e={weekday:"long",year:"numeric",month:"long",day:"numeric"};t.textContent=new Date().toLocaleDateString("en-US",e)}}function j(){Ge(),Je(),we(),_e()}function Ge(){const t=b.filter(r=>r.status!=="Cancelled"),e=t.filter(r=>r.status==="Completed"||r.status==="Preparing").reduce((r,o)=>r+o.total,0),n=b.filter(r=>r.status==="Pending"||r.status==="Preparing").length,i=t.reduce((r,o)=>r+o.items.reduce((d,s)=>d+s.quantity,0),0),l=t.filter(r=>r.status==="Completed"||r.status==="Preparing").length,a=l>0?e/l:0;te("revenue-val",`₱${e.toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2})}`),te("active-orders-val",n.toString()),te("avg-order-val",`₱${a.toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2})}`),te("items-sold-val",i.toString()),ne("revenue-trend",e>5e3?"+14.2%":"+0%",e>5e3),ne("active-trend",n>2?"+25%":"+0%",n>2),ne("avg-trend",a>300?"+4.8%":"+0%",a>300),ne("items-trend",i>5?"+18%":"+0%",i>5)}function te(t,e){const n=document.getElementById(t);n&&(n.textContent=e)}function ne(t,e,n){const i=document.getElementById(t);if(i){const l=i.querySelector(".trend-text");l&&(l.textContent=e),i.className=`trend-badge ${n?"trend-up":"trend-down"}`;const a=i.querySelector(".trend-icon");a&&(a.innerHTML=n?'<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m5 12 7-7 7 7"/><path d="M12 5v14"/></svg>':'<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14"/><path d="m19 12-7 7-7-7"/></svg>')}}function Je(){const t=document.getElementById("best-sellers-list");if(!t)return;const e=b.filter(r=>r.status!=="Cancelled"),n={};e.forEach(r=>{r.items.forEach(o=>{const d=o.name;n[d]||(n[d]={quantity:0,revenue:0}),n[d].quantity+=o.quantity,n[d].revenue+=o.total})});const i=Object.keys(n).map(r=>({name:r,quantity:n[r].quantity,revenue:n[r].revenue}));if(i.sort((r,o)=>o.quantity-r.quantity),i.length===0){t.innerHTML=`
				<div class="empty-state">
					<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v20"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
					<p>No orders recorded yet to calculate sales.</p>
				</div>
			`;return}const l=i[0].quantity,a=i.slice(0,4);t.innerHTML=a.map((r,o)=>{const d=o+1,s=d<=3?`rank-${d}`:"rank-other",u=l>0?r.quantity/l*100:0;return`
				<div class="seller-item">
					<div class="rank-badge ${s}">#${d}</div>
					<div class="seller-info">
						<div class="seller-meta">
							<span class="seller-name">${r.name}</span>
							<div class="seller-stats">
								<span class="sales-count">${r.quantity} sold</span>
								<span class="sales-revenue">₱${r.revenue.toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2})}</span>
							</div>
						</div>
						<div class="progress-track">
							<div class="progress-fill" style="width: ${u}%"></div>
						</div>
					</div>
				</div>
			`}).join("")}function we(){const t=document.getElementById("order-table-body"),e=document.getElementById("table-empty-state");if(!t||!e)return;let n=b;if(he!=="All"&&(n=n.filter(l=>l.status===he)),ke.trim()!==""){const l=ke.toLowerCase().trim();n=n.filter(a=>a.id.toLowerCase().includes(l)||a.customer.toLowerCase().includes(l)||a.items.some(r=>r.name.toLowerCase().includes(l)))}const i=new Date;if(n.sort((l,a)=>{const r=l.deliveryDateTime||l.date,o=a.deliveryDateTime||a.date,d=new Date(r.replace(" ","T")),s=new Date(o.replace(" ","T")),u=isNaN(d.getTime())?1/0:d.getTime(),c=isNaN(s.getTime())?1/0:s.getTime(),p=Math.abs(u-i.getTime()),m=Math.abs(c-i.getTime());return p-m}),n.length===0){t.innerHTML="",e.style.display="flex";return}else e.style.display="none";t.innerHTML=n.map(l=>{const a=`badge-${l.status.toLowerCase()}`;return`
				<tr data-order-id="${l.id}">
					<td>
						<button class="action-btn btn-view-details" data-id="${l.id}" title="View Details">
							<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0z"/><circle cx="12" cy="12" r="3"/></svg>
						</button>
					</td>
					<td class="order-id-cell">#${l.id.replace("ORD-","")}</td>
					<td class="customer-cell">${l.customer}</td>
					<td class="date-cell">${l.deliveryDateTime||'<span class="text-muted">Pending Customer Input</span>'}</td>
					<td><span class="status-badge ${a}">${l.status}</span></td>
				</tr>
			`}).join(""),Ke()}function _e(){const t=document.getElementById("count-all"),e=document.getElementById("count-pending"),n=document.getElementById("count-preparing"),i=document.getElementById("count-completed"),l=document.getElementById("count-cancelled");t&&(t.textContent=b.length.toString()),e&&(e.textContent=b.filter(a=>a.status==="Pending").length.toString()),n&&(n.textContent=b.filter(a=>a.status==="Preparing").length.toString()),i&&(i.textContent=b.filter(a=>a.status==="Completed").length.toString()),l&&(l.textContent=b.filter(a=>a.status==="Cancelled").length.toString())}function Ye(){const t=document.getElementById("open-order-modal-btn"),e=document.getElementById("close-order-modal-btn"),n=document.getElementById("cancel-order-btn"),i=document.getElementById("order-modal-overlay"),l=()=>i?.classList.add("active"),a=()=>{i?.classList.remove("active"),ze()};t?.addEventListener("click",l),e?.addEventListener("click",a),n?.addEventListener("click",a),i?.addEventListener("click",v=>{v.target===i&&a()}),document.getElementById("order-search")?.addEventListener("input",v=>{ke=v.target.value,we()});const d=document.getElementById("order-status-tabs")?.querySelectorAll(".filter-tab");d?.forEach(v=>{v.addEventListener("click",()=>{d.forEach(h=>h.classList.remove("active")),v.classList.add("active"),he=v.getAttribute("data-status")||"All",we()})});const s=document.getElementById("link-modal-overlay"),u=document.getElementById("close-link-modal-btn"),c=document.getElementById("close-link-modal-action-btn"),p=()=>{s?.classList.remove("active")};u?.addEventListener("click",p),c?.addEventListener("click",p),s?.addEventListener("click",v=>{v.target===s&&p()});const m=document.getElementById("details-modal-overlay"),y=document.getElementById("close-details-modal-btn"),g=()=>{m?.classList.remove("active")};y?.addEventListener("click",g),m?.addEventListener("click",v=>{v.target===m&&g()});const x=document.getElementById("copy-shareable-link-btn"),I=document.getElementById("shareable-link-input");x?.addEventListener("click",()=>{I&&I.value&&navigator.clipboard.writeText(I.value).then(()=>{k("Shareable link copied to clipboard!");const v=x.textContent;x.textContent="Copied!",setTimeout(()=>{x.textContent=v},2e3)})})}function Ke(){document.querySelectorAll(".btn-view-details").forEach(t=>{t.addEventListener("click",e=>{const n=e.currentTarget.getAttribute("data-id");n&&Ee(n)})})}let G=null,T=null,J=[];function Ee(t){G=t,T=null,J=[],document.getElementById("details-modal-overlay")?.classList.add("active"),O()}function O(){const t=G;if(!t)return;const e=b.find(c=>c.id===t);if(!e)return;const n=document.getElementById("details-title");n&&(n.textContent=`Order #${t.replace("ORD-","")}`);let i="";T==="items"?i=`
				<form id="edit-items-form" style="display: flex; flex-direction: column; gap: 12px; margin-top: 4px;">
					<div id="edit-items-list-container" style="display: flex; flex-direction: column; gap: 10px; max-height: 250px; overflow-y: auto; padding-right: 4px;">
						${J.map((c,p)=>`
							<div class="edit-item-row" data-idx="${p}" style="display: flex; flex-direction: column; gap: 6px; padding: 10px; background: rgba(0,0,0,0.2); border: 1px solid var(--border-color); border-radius: 8px;">
								<div style="display: flex; gap: 8px; align-items: center; flex-wrap: wrap;">
									<input type="number" class="edit-item-qty" style="width: 55px; background: rgba(0,0,0,0.3); border: 1px solid var(--border-color); color: var(--text-primary); padding: 4px 6px; border-radius: 4px; font-size: 0.8rem; text-align: center;" value="${c.quantity}" min="1" required />
									<input type="text" class="edit-item-name" style="flex: 1; min-width: 120px; background: rgba(0,0,0,0.3); border: 1px solid var(--border-color); color: var(--text-primary); padding: 4px 6px; border-radius: 4px; font-size: 0.8rem;" value="${c.name}" placeholder="Item Name" required />
									<input type="number" step="0.01" class="edit-item-price" style="width: 85px; background: rgba(0,0,0,0.3); border: 1px solid var(--border-color); color: var(--text-primary); padding: 4px 6px; border-radius: 4px; font-size: 0.8rem; text-align: right;" value="${c.price}" required />
									<button type="button" class="btn-remove-edit-item" data-idx="${p}" style="background: transparent; border: none; color: #ef4444; cursor: pointer; padding: 4px;" title="Remove Item">
										<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
									</button>
								</div>
								<div style="display: flex; flex-direction: column; gap: 2px;">
									<label style="font-size: 0.65rem; color: var(--text-secondary); font-weight: 700; text-transform: uppercase;">Custom Inclusions (comma-separated)</label>
									<input type="text" class="edit-item-inclusions" style="width: 100%; background: rgba(0,0,0,0.3); border: 1px solid var(--border-color); color: var(--text-primary); padding: 4px 6px; border-radius: 4px; font-size: 0.75rem;" value="${(c.customInclusions||[]).join(", ")}" placeholder="e.g. 1 whole Lechon Baboy, 1 tray Buttered Shrimps" />
								</div>
							</div>
						`).join("")}
					</div>
					<div style="display: flex; justify-content: space-between; align-items: center; margin-top: 4px;">
						<button type="button" id="btn-add-edit-item" class="btn btn-secondary" style="padding: 6px 12px; font-size: 0.75rem; display: inline-flex; align-items: center; gap: 4px; background: rgba(255,255,255,0.05); border: 1px solid var(--border-color); color: var(--text-primary);">
							<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
							<span>Add Item</span>
						</button>
						<div style="display: flex; gap: 8px;">
							<button type="button" class="btn btn-secondary btn-cancel-edit" style="padding: 6px 12px; font-size: 0.75rem;">Cancel</button>
							<button type="submit" class="btn btn-primary btn-save-items" style="padding: 6px 12px; font-size: 0.75rem; background: var(--accent-primary); color: white; border: none; font-weight: 700; border-radius: 6px; cursor: pointer;">Save</button>
						</div>
					</div>
				</form>
			`:i=`
				<div class="detail-items-list" style="max-height: 200px; overflow-y: auto; padding-right: 4px;">
					${e.items.map(p=>{const m=p.customInclusions&&p.customInclusions.length>0?`
					<div class="detail-item-customizations" style="grid-column: 1 / -1; margin-top: 4px; padding-left: 12px; font-size: 0.75rem; color: var(--accent-primary); border-left: 2px solid var(--accent-primary);">
						<div style="font-weight: 700; text-transform: uppercase; font-size: 0.65rem; margin-bottom: 2px;">Custom Inclusions:</div>
						<ul style="margin: 0; padding-left: 12px; list-style-type: disc; color: var(--text-secondary);">
							${p.customInclusions.map(y=>`<li>${y}</li>`).join("")}
						</ul>
					</div>
				`:"";return`
					<div class="detail-item-row" style="display: grid; grid-template-columns: auto 1fr auto auto; gap: 12px; padding: 10px 0; border-bottom: 1px solid rgba(255, 255, 255, 0.05); font-size: 0.875rem;">
						<span class="detail-item-qty" style="color: var(--accent-primary); font-weight: 700;">${p.quantity}x</span>
						<span class="detail-item-name" style="color: var(--text-primary); font-weight: 500;">${p.name}</span>
						<span class="detail-item-price" style="color: var(--text-secondary);">₱${p.price.toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2})}</span>
						<span class="detail-item-total" style="color: var(--text-primary); font-weight: 600;">₱${p.total.toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2})}</span>
						${m}
					</div>
				`}).join("")}
				</div>
			`;let l="";T==="payment"?l=`
				<form id="edit-payment-form" style="display: flex; flex-direction: column; gap: 10px; margin-top: 4px;">
					<div class="form-group" style="display: flex; flex-direction: column; gap: 4px;">
						<label style="font-size: 0.7rem; color: var(--text-secondary); font-weight: 700; text-transform: uppercase;">Delivery/Meetup Fee</label>
						<input type="number" step="0.01" id="edit-delivery-fee" style="width: 100%; background: rgba(0,0,0,0.3); border: 1px solid var(--border-color); color: var(--text-primary); padding: 6px 10px; border-radius: 6px; font-size: 0.875rem;" value="${e.deliveryFee||0}" required />
					</div>
					<div class="form-group" style="display: flex; flex-direction: column; gap: 4px;">
						<label style="font-size: 0.7rem; color: var(--text-secondary); font-weight: 700; text-transform: uppercase;">Downpayment Paid</label>
						<input type="number" step="0.01" id="edit-downpayment" style="width: 100%; background: rgba(0,0,0,0.3); border: 1px solid var(--border-color); color: var(--text-primary); padding: 6px 10px; border-radius: 6px; font-size: 0.875rem;" value="${e.downpayment}" required />
					</div>
					<div style="display: flex; gap: 8px; margin-top: 8px; justify-content: flex-end;">
						<button type="button" class="btn btn-secondary btn-cancel-edit" style="padding: 6px 12px; font-size: 0.75rem;">Cancel</button>
						<button type="submit" class="btn btn-primary btn-save-payment" style="padding: 6px 12px; font-size: 0.75rem; background: var(--accent-primary); color: white; border: none; font-weight: 700; border-radius: 6px; cursor: pointer;">Save</button>
					</div>
				</form>
			`:l=`
				<div class="detail-fields" style="display: flex; flex-direction: column; gap: 8px;">
					<div class="detail-field" style="display: flex; justify-content: space-between; font-size: 0.875rem;">
						<span class="field-label" style="color: var(--text-secondary);">Subtotal:</span>
						<span class="field-value" style="color: var(--text-primary);">₱${(e.total-(e.deliveryFee||0)).toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2})}</span>
					</div>
					<div class="detail-field" style="display: flex; justify-content: space-between; font-size: 0.875rem;">
						<span class="field-label" style="color: var(--text-secondary);">Delivery/Meetup Fee:</span>
						<span class="field-value" style="color: var(--text-primary);">₱${(e.deliveryFee||0).toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2})}</span>
					</div>
					<div class="detail-field" style="display: flex; justify-content: space-between; font-size: 0.875rem; border-top: 1px solid rgba(255, 255, 255, 0.05); padding-top: 6px; margin-top: 2px;">
						<span class="field-label" style="color: var(--text-secondary); font-weight: 700;">Total Bill:</span>
						<span class="field-value highlight-total" style="font-weight: 700; color: var(--text-primary); font-size: 1rem;">₱${e.total.toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2})}</span>
					</div>
					<div class="detail-field" style="display: flex; justify-content: space-between; font-size: 0.875rem;">
						<span class="field-label" style="color: var(--text-secondary);">Downpayment Paid:</span>
						<span class="field-value highlight-downpayment" style="font-weight: 700; color: var(--status-preparing);">₱${e.downpayment.toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2})}</span>
					</div>
					<div class="detail-field" style="display: flex; justify-content: space-between; font-size: 0.875rem;">
						<span class="field-label" style="color: var(--text-secondary);">Remaining Balance:</span>
						<span class="field-value highlight-balance" style="font-weight: 700; color: var(--accent-primary);">₱${e.balance.toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2})}${e.status==="Completed"?' <span style="font-size:0.75rem;color:#10b981;font-weight:800;">(Settled)</span>':""}</span>
					</div>
				</div>
			`;let a="";T==="customer"?a=`
				<form id="edit-customer-form" style="display: flex; flex-direction: column; gap: 10px; margin-top: 4px;">
					<div class="form-group" style="display: flex; flex-direction: column; gap: 4px;">
						<label style="font-size: 0.7rem; color: var(--text-secondary); font-weight: 700; text-transform: uppercase;">Customer Name</label>
						<input type="text" id="edit-customer-name" style="width: 100%; background: rgba(0,0,0,0.3); border: 1px solid var(--border-color); color: var(--text-primary); padding: 6px 10px; border-radius: 6px; font-size: 0.875rem;" value="${e.customer}" required />
					</div>
					<div class="form-group" style="display: flex; flex-direction: column; gap: 4px;">
						<label style="font-size: 0.7rem; color: var(--text-secondary); font-weight: 700; text-transform: uppercase;">Fulfillment Type</label>
						<select id="edit-fulfillment-type" style="width: 100%; background: rgba(0,0,0,0.3); border: 1px solid var(--border-color); color: var(--text-primary); padding: 6px 10px; border-radius: 6px; font-size: 0.875rem; color-scheme: dark;">
							<option value="Pickup" ${e.fulfillmentType==="Pickup"?"selected":""}>PICKUP</option>
							<option value="Meetup" ${e.fulfillmentType==="Meetup"?"selected":""}>MEETUP</option>
							<option value="Delivery" ${e.fulfillmentType==="Delivery"?"selected":""}>DELIVERY</option>
						</select>
					</div>
					<div class="form-group" style="display: flex; flex-direction: column; gap: 4px;">
						<label style="font-size: 0.7rem; color: var(--text-secondary); font-weight: 700; text-transform: uppercase;">Order Status</label>
						<select id="edit-order-status" style="width: 100%; background: rgba(0,0,0,0.3); border: 1px solid var(--border-color); color: var(--text-primary); padding: 6px 10px; border-radius: 6px; font-size: 0.875rem; color-scheme: dark;">
							<option value="Pending" ${e.status==="Pending"?"selected":""}>Pending</option>
							<option value="Preparing" ${e.status==="Preparing"?"selected":""}>Preparing</option>
							<option value="Completed" ${e.status==="Completed"?"selected":""}>Completed</option>
							<option value="Cancelled" ${e.status==="Cancelled"?"selected":""}>Cancelled</option>
						</select>
					</div>
					<div class="form-group" style="display: flex; flex-direction: column; gap: 4px;">
						<label style="font-size: 0.7rem; color: var(--text-secondary); font-weight: 700; text-transform: uppercase;">Exact Address</label>
						<input type="text" id="edit-customer-address" style="width: 100%; background: rgba(0,0,0,0.3); border: 1px solid var(--border-color); color: var(--text-primary); padding: 6px 10px; border-radius: 6px; font-size: 0.875rem;" value="${e.address||""}" />
					</div>
					<div class="form-group" style="display: flex; flex-direction: column; gap: 4px;">
						<label style="font-size: 0.7rem; color: var(--text-secondary); font-weight: 700; text-transform: uppercase;">Contact Number</label>
						<input type="text" id="edit-customer-contact" style="width: 100%; background: rgba(0,0,0,0.3); border: 1px solid var(--border-color); color: var(--text-primary); padding: 6px 10px; border-radius: 6px; font-size: 0.875rem;" value="${e.contact||""}" />
					</div>
					<div class="form-group" style="display: flex; flex-direction: column; gap: 4px;">
						<label style="font-size: 0.7rem; color: var(--text-secondary); font-weight: 700; text-transform: uppercase;">Delivery Date & Time</label>
						<input type="datetime-local" id="edit-delivery-datetime" style="width: 100%; background: rgba(0,0,0,0.3); border: 1px solid var(--border-color); color: var(--text-primary); padding: 6px 10px; border-radius: 6px; font-size: 0.875rem; color-scheme: dark;" value="${(e.deliveryDateTime||"").replace(" ","T")}" />
					</div>
					<div style="display: flex; gap: 8px; margin-top: 8px; justify-content: flex-end;">
						<button type="button" class="btn btn-secondary btn-cancel-edit" style="padding: 6px 12px; font-size: 0.75rem;">Cancel</button>
						<button type="submit" class="btn btn-primary btn-save-customer" style="padding: 6px 12px; font-size: 0.75rem; background: var(--accent-primary); color: white; border: none; font-weight: 700; border-radius: 6px; cursor: pointer;">Save</button>
					</div>
				</form>
			`:a=`
				<div class="detail-fields" style="display: flex; flex-direction: column; gap: 10px; font-size: 0.875rem;">
					<div class="detail-field" style="display: flex; flex-direction: column; gap: 2px;">
						<span class="field-label" style="color: var(--text-secondary); font-size: 0.75rem;">Customer Name:</span>
						<span class="field-value" style="color: var(--text-primary); font-weight: 500;">${e.customer}</span>
					</div>
					<div class="detail-field" style="display: flex; flex-direction: column; gap: 2px;">
						<span class="field-label" style="color: var(--text-secondary); font-size: 0.75rem;">Fulfillment Type:</span>
						<span class="field-value" style="color: var(--text-primary); font-weight: 500; text-transform: uppercase; letter-spacing: 0.03em;">${e.fulfillmentType||"Delivery"}</span>
					</div>
					<div class="detail-field" style="display: flex; flex-direction: column; gap: 2px;">
						<span class="field-label" style="color: var(--text-secondary); font-size: 0.75rem;">Order Status:</span>
						<span class="field-value" style="color: var(--text-primary); font-weight: 500;"><span class="status-badge badge-${e.status.toLowerCase()}">${e.status}</span></span>
					</div>
					<div class="detail-field" style="display: flex; flex-direction: column; gap: 2px;">
						<span class="field-label" style="color: var(--text-secondary); font-size: 0.75rem;">Order Created:</span>
						<span class="field-value" style="color: var(--text-primary); font-weight: 500;">${e.date}</span>
					</div>
					<div class="detail-field" style="display: flex; flex-direction: column; gap: 2px;">
						<span class="field-label" style="color: var(--text-secondary); font-size: 0.75rem;">Exact Address:</span>
						<span class="field-value" style="color: var(--text-primary); font-weight: 500; line-height: 1.4;">${e.address||"N/A"}</span>
					</div>
					<div class="detail-field" style="display: flex; flex-direction: column; gap: 2px;">
						<span class="field-label" style="color: var(--text-secondary); font-size: 0.75rem;">Contact Number:</span>
						<span class="field-value" style="color: var(--text-primary); font-weight: 500;">${e.contact||"N/A"}</span>
					</div>
					<div class="detail-field" style="display: flex; flex-direction: column; gap: 2px;">
						<span class="field-label" style="color: var(--text-secondary); font-size: 0.75rem;">Delivery Date & Time:</span>
						<span class="field-value" style="color: var(--text-primary); font-weight: 500;">${e.deliveryDateTime||"N/A"}</span>
					</div>
				</div>
			`;const r=Xe(e),o=T?"":`
			<button class="btn-edit-section" data-section="items" style="background: transparent; border: none; color: var(--accent-primary); cursor: pointer; font-size: 0.75rem; font-weight: 700; text-transform: uppercase; padding: 2px 6px; border-radius: 4px; border: 1px solid rgba(217, 43, 58, 0.2); transition: all 0.2s;" title="Edit Items">Edit</button>
		`,d=T?"":`
			<button class="btn-edit-section" data-section="payment" style="background: transparent; border: none; color: var(--accent-primary); cursor: pointer; font-size: 0.75rem; font-weight: 700; text-transform: uppercase; padding: 2px 6px; border-radius: 4px; border: 1px solid rgba(217, 43, 58, 0.2); transition: all 0.2s;" title="Edit Payments">Edit</button>
		`,s=T?"":`
			<button class="btn-edit-section" data-section="customer" style="background: transparent; border: none; color: var(--accent-primary); cursor: pointer; font-size: 0.75rem; font-weight: 700; text-transform: uppercase; padding: 2px 6px; border-radius: 4px; border: 1px solid rgba(217, 43, 58, 0.2); transition: all 0.2s;" title="Edit Customer Details">Edit</button>
		`,u=document.getElementById("details-modal-body");u&&(u.innerHTML=`
				<div class="detail-grid" style="display: grid; grid-template-columns: 1.2fr 1fr; gap: 24px; text-align: left; align-items: start;">
					<!-- Left Column: Items Breakdown & Payments -->
					<div class="detail-left-column" style="display: flex; flex-direction: column; gap: 20px;">
						<!-- Items breakdown card -->
						<div class="detail-section glass-panel" style="padding: 16px; border-radius: 12px; background: rgba(255, 255, 255, 0.02); border: 1px solid rgba(255, 255, 255, 0.05);">
							<div class="detail-header-row" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
								<div class="detail-section-title" style="font-size: 0.75rem; font-weight: 800; text-transform: uppercase; color: var(--accent-primary); letter-spacing: 0.05em;">Items Breakdown</div>
								${o}
							</div>
							${i}
						</div>
						
						<!-- Payment breakdown card -->
						<div class="detail-section glass-panel" style="padding: 16px; border-radius: 12px; background: rgba(255, 255, 255, 0.02); border: 1px solid rgba(255, 255, 255, 0.05);">
							<div class="detail-header-row" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
								<div class="detail-section-title" style="font-size: 0.75rem; font-weight: 800; text-transform: uppercase; color: var(--accent-primary); letter-spacing: 0.05em;">Payment Breakdown</div>
								${d}
							</div>
							${l}
						</div>
					</div>
					
					<!-- Right Column: Delivery Info, Status & Manage buttons -->
					<div class="detail-right-column" style="display: flex; flex-direction: column; gap: 20px;">
						<!-- Customer & Delivery details card -->
						<div class="detail-section glass-panel" style="padding: 16px; border-radius: 12px; background: rgba(255, 255, 255, 0.02); border: 1px solid rgba(255, 255, 255, 0.05);">
							<div class="detail-header-row" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
								<div class="detail-section-title" style="font-size: 0.75rem; font-weight: 800; text-transform: uppercase; color: var(--accent-primary); letter-spacing: 0.05em;">Delivery & Contact Details</div>
								${s}
							</div>
							${a}
						</div>

						<!-- Manage Order card (Moved from bottom to right column) -->
						<div class="detail-section glass-panel" style="padding: 16px; border-radius: 12px; background: rgba(255, 255, 255, 0.02); border: 1px solid rgba(255, 255, 255, 0.05);">
							<div class="detail-section-title" style="font-size: 0.75rem; font-weight: 800; text-transform: uppercase; color: var(--accent-primary); margin-bottom: 12px; letter-spacing: 0.05em;">Manage Order</div>
							<div class="detail-actions-buttons" style="display: flex; flex-direction: column; gap: 10px; width: 100%;">
								${r}
							</div>
						</div>
					</div>
				</div>
			`,Qe(),We())}function We(){const t=document.getElementById("details-modal-body");if(!t)return;t.querySelectorAll(".btn-edit-section").forEach(a=>{a.addEventListener("click",r=>{const o=r.currentTarget.getAttribute("data-section");if(o){if(T=o,o==="items"){const d=b.find(s=>s.id===G);d&&(J=d.items.map(s=>({name:s.name,quantity:s.quantity,price:s.price,total:s.total,customInclusions:s.customInclusions?[...s.customInclusions]:[]})))}O()}})}),t.querySelectorAll(".btn-cancel-edit").forEach(a=>{a.addEventListener("click",()=>{T=null,O()})}),document.getElementById("edit-customer-form")?.addEventListener("submit",async a=>{a.preventDefault();const r=G;if(!r)return;const o=b.find(x=>x.id===r);if(!o)return;const d=document.getElementById("edit-customer-name").value.trim(),s=document.getElementById("edit-fulfillment-type").value,u=document.getElementById("edit-order-status").value,c=document.getElementById("edit-customer-address").value.trim(),p=document.getElementById("edit-customer-contact").value.trim(),m=document.getElementById("edit-delivery-datetime").value,y=m?m.replace("T"," "):"",g={customer:d,fulfillment_type:s,status:u,address:c,contact:p,delivery_date_time:y||null};try{if(!(await fetch("/.netlify/functions/update-order",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({id:r,orderUpdates:g})})).ok){k("Failed to update customer details.");return}o.customer=d,o.fulfillmentType=s,o.status=u,o.address=c,o.contact=p,o.deliveryDateTime=y,T=null,j(),O(),k("Customer details updated!")}catch(x){console.error(x),k("Error updating customer details.")}}),document.getElementById("edit-payment-form")?.addEventListener("submit",async a=>{a.preventDefault();const r=G;if(!r)return;const o=b.find(y=>y.id===r);if(!o)return;const d=parseFloat(document.getElementById("edit-delivery-fee").value)||0,s=parseFloat(document.getElementById("edit-downpayment").value)||0,u=o.items.reduce((y,g)=>y+g.total,0),c=parseFloat((u+d).toFixed(2)),p=parseFloat((c-s).toFixed(2)),m={delivery_fee:d,downpayment:s,total:c,balance:p};try{if(!(await fetch("/.netlify/functions/update-order",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({id:r,orderUpdates:m})})).ok){k("Failed to update payment details.");return}o.deliveryFee=d,o.downpayment=s,o.total=c,o.balance=p,T=null,j(),O(),k("Payment breakdown updated!")}catch(y){console.error(y),k("Error updating payments.")}}),document.getElementById("edit-items-form")?.addEventListener("submit",async a=>{a.preventDefault();const r=G;if(!r)return;const o=b.find(g=>g.id===r);if(!o)return;const d=t.querySelectorAll(".edit-item-row"),s=[];if(d.forEach(g=>{const x=parseInt(g.querySelector(".edit-item-qty").value)||1,I=g.querySelector(".edit-item-name").value.trim(),v=parseFloat(g.querySelector(".edit-item-price").value)||0,h=parseFloat((x*v).toFixed(2)),q=g.querySelector(".edit-item-inclusions").value.split(",").map(D=>D.trim()).filter(D=>D.length>0);s.push({name:I,quantity:x,price:v,total:h,customInclusions:q})}),s.length===0){k("An order must have at least one item.");return}const u=s.reduce((g,x)=>g+x.total,0),c=o.deliveryFee||0,p=parseFloat((u+c).toFixed(2)),m=parseFloat((p-o.downpayment).toFixed(2)),y={total:p,balance:m};try{if(!(await fetch("/.netlify/functions/update-order",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({id:r,orderUpdates:y,items:s})})).ok){k("Failed to update items.");return}o.items=s,o.total=p,o.balance=m,T=null,j(),O(),k("Items breakdown updated!")}catch(g){console.error(g),k("Error updating items.")}}),document.getElementById("btn-add-edit-item")?.addEventListener("click",()=>{J.push({name:"",quantity:1,price:0,total:0,customInclusions:[]}),O();const a=t.querySelectorAll(".edit-item-name");a.length>0&&a[a.length-1].focus()}),t.querySelectorAll(".btn-remove-edit-item").forEach(a=>{a.addEventListener("click",r=>{const o=r.currentTarget.getAttribute("data-idx");if(o!==null){const d=parseInt(o);J.splice(d,1),O()}})}),t.querySelectorAll(".edit-item-qty, .edit-item-price, .edit-item-name, .edit-item-inclusions").forEach(a=>{a.addEventListener("change",r=>{const o=r.currentTarget.closest(".edit-item-row");if(!o)return;const d=o.getAttribute("data-idx");if(d!==null){const s=parseInt(d),u=parseInt(o.querySelector(".edit-item-qty").value)||1,c=o.querySelector(".edit-item-name").value.trim(),p=parseFloat(o.querySelector(".edit-item-price").value)||0,y=o.querySelector(".edit-item-inclusions").value.split(",").map(g=>g.trim()).filter(g=>g.length>0);J[s]={name:c,quantity:u,price:p,total:parseFloat((u*p).toFixed(2)),customInclusions:y}}})})}function Qe(){const t=document.getElementById("details-modal-body");t&&(t.querySelectorAll(".btn-prepare").forEach(e=>{e.addEventListener("click",async n=>{const i=n.currentTarget.getAttribute("data-id");if(!i)return;await Q(`Are you sure you want to mark Order #${i.replace("ORD-","")} as Preparing?`)&&(await Y(i,"Preparing"),O())})}),t.querySelectorAll(".btn-complete").forEach(e=>{e.addEventListener("click",async n=>{const i=n.currentTarget.getAttribute("data-id");if(!i)return;await Q(`Are you sure you want to mark Order #${i.replace("ORD-","")} as Completed?`)&&(await Y(i,"Completed"),document.getElementById("details-modal-overlay")?.classList.remove("active"))})}),t.querySelectorAll(".btn-cancel").forEach(e=>{e.addEventListener("click",async n=>{const i=n.currentTarget.getAttribute("data-id");if(!i)return;await Q(`Are you sure you want to cancel Order #${i.replace("ORD-","")}?`)&&(await Y(i,"Cancelled"),document.getElementById("details-modal-overlay")?.classList.remove("active"))})}),t.querySelectorAll(".btn-delete").forEach(e=>{e.addEventListener("click",async n=>{const i=n.currentTarget.getAttribute("data-id");if(!i)return;await Q(`Are you sure you want to delete the record for Order #${i.replace("ORD-","")}?`)&&(await Ze(i),document.getElementById("details-modal-overlay")?.classList.remove("active"))})}),t.querySelectorAll(".btn-copy-slip").forEach(e=>{e.addEventListener("click",n=>{const i=n.currentTarget.getAttribute("data-id");i&&tt(i,n.currentTarget)})}),t.querySelectorAll(".btn-get-link").forEach(e=>{e.addEventListener("click",n=>{const i=n.currentTarget.getAttribute("data-id");if(i){const l=window.location.origin+"/order?id="+i;navigator.clipboard.writeText(l).then(()=>{const a=n.currentTarget;a.classList.add("copied");const r=a.innerHTML;a.innerHTML=`
							<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
							<span>Copied!</span>
						`,k("Customer share link copied to clipboard!"),setTimeout(()=>{a.classList.remove("copied"),a.innerHTML=r},2e3)}).catch(a=>{console.error("Could not copy link to clipboard: ",a)})}})}),t.querySelectorAll(".btn-download-receipt").forEach(e=>{e.addEventListener("click",n=>{const i=n.currentTarget.getAttribute("data-id");i&&nt(i)})}))}function Xe(t){let e="";return t.status==="Pending"?e+=`
				<button class="action-btn btn-prepare" data-id="${t.id}" title="Start Preparing">
					<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><path d="M6 9V3a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v6"/><rect width="12" height="8" x="6" y="14" rx="1"/></svg>
					<span>Prepare Order</span>
				</button>
			`:t.status==="Preparing"&&(e+=`
				<button class="action-btn btn-complete" data-id="${t.id}" title="Complete Order">
					<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
					<span>Complete Order</span>
				</button>
			`),(t.status==="Pending"||t.status==="Preparing")&&(e+=`
				<button class="action-btn btn-cancel" data-id="${t.id}" title="Cancel Order">
					<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/></svg>
					<span>Cancel</span>
				</button>
			`),e+=`
			<button class="action-btn btn-delete" data-id="${t.id}" title="Delete Record">
				<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
				<span>Delete</span>
			</button>
		`,t.customer==="Pending Customer Details"&&(e=`
				<button class="action-btn btn-get-link" data-id="${t.id}" title="Copy Customer Share Link">
					<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
					<span>Copy Link</span>
				</button>
			`+e),e=`
			<button class="action-btn btn-copy-slip" data-id="${t.id}" title="Copy Confirmation Slip">
				<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
				<span>Copy Slip</span>
			</button>
		`+e,e=`
			<button class="action-btn btn-download-receipt" data-id="${t.id}" title="Download Receipt" style="background: rgba(16, 185, 129, 0.1); border-color: rgba(16, 185, 129, 0.25); color: #10b981;">
				<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
				<span>Receipt</span>
			</button>
		`+e,e}async function Y(t,e){const{error:n}=await le.from("orders").update({status:e}).eq("id",t);if(n){console.error("Failed to update status:",n.message),k("Failed to update order status.");return}const i=b.findIndex(l=>l.id===t);i>-1&&(b[i].status=e),j(),k(`Order status updated to ${e}!`)}async function Ze(t){try{const e=await fetch("/.netlify/functions/delete-order",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({id:t})}),n=await e.json().catch(()=>({}));if(!e.ok){console.error("Failed to delete order (server):",n),k("Failed to delete order.");return}b=b.filter(i=>i.id!==t),j()}catch(e){console.error("Failed to delete order:",e),k("Failed to delete order.")}}function et(t){const e=document.getElementById("link-modal-overlay"),n=document.getElementById("shareable-link-input"),i=document.getElementById("open-shareable-link-btn"),l=window.location.origin+"/order?id="+t;n&&(n.value=l),i&&(i.href=l),e?.classList.add("active")}function tt(t,e){const n=b.find(o=>o.id===t);if(!n)return;const i=n.items.map(o=>{let d=`${o.quantity}x ${o.name}`;return o.customInclusions&&o.customInclusions.length>0&&(d+=`
  (Custom Inclusions:
`+o.customInclusions.map(s=>`   - ${s}`).join(`
`)+")"),d}).join(`
`),l=n.total-(n.deliveryFee||0),a=n.deliveryFee||0,r=`C O N F I R M A T I O N   S L I P
Please fill up the following.

Name: ${n.customer}
Fulfillment: ${n.fulfillmentType||"Delivery"}
Exact Address: ${n.address}
Contact Number of the Receiver/s: ${n.contact}
Time & Date: ${n.deliveryDateTime}
List of Order/s:
${i}

Subtotal: ₱${l.toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2})}
Delivery/Meetup Fee: ₱${a.toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2})}
TOTAL: ₱${n.total.toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2})}
DOWNPAYMENT: ₱${n.downpayment.toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2})}
BALANCE: ₱${n.balance.toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2})}${n.status==="Completed"?" (Settled)":""}

Note: To confirm your order, we are requesting 50% downpayment of the total bill, then the rest will be paid upon pickup/delivery of orders.

M O D E   O F   P A Y M E N T S

Maribank Details
Christy Montejo
11953471393

Gcash Details
Christy Montejo
09760721404`;navigator.clipboard.writeText(r).then(()=>{e.classList.add("copied");const o=e.innerHTML;e.innerHTML=`
				<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
				<span>Copied!</span>
			`,k("Confirmation slip copied to clipboard!"),setTimeout(()=>{e.classList.remove("copied"),e.innerHTML=o},2e3)}).catch(o=>{console.error("Could not copy confirmation slip to clipboard: ",o)})}function nt(t){const e=b.find(s=>s.id===t);if(!e)return;const n=e.deliveryFee||0,i=e.total-n,l=window.open("","_blank");if(!l){k("Please allow popups to download/print receipts.");return}let a="UNPAID",r="status-unpaid",o="Please make a downpayment to confirm your order.";e.downpayment>=e.total?(a="PAID",r="status-paid",o="Order has been fully paid. Thank you!"):e.downpayment>0&&(a="PARTIALLY PAID",r="status-partial",o="Downpayment received. Remaining balance to be settled upon pickup/delivery.");const d=`
<!DOCTYPE html>
<html>
<head>
	<title>Receipt ${e.id}</title>
	<link rel="preconnect" href="https://fonts.googleapis.com">
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
	<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
	<style>
		:root {
			--primary: #0f172a;
			--accent: #f97316;
			--text-main: #334155;
			--text-muted: #64748b;
			--border: #e2e8f0;
			--bg-light: #f8fafc;
		}
		* {
			box-sizing: border-box;
			margin: 0;
			padding: 0;
		}
		body {
			font-family: 'Plus Jakarta Sans', sans-serif;
			color: var(--text-main);
			background-color: #f1f5f9;
			padding: 40px 20px;
			display: flex;
			justify-content: center;
			align-items: center;
		}
		.receipt-container {
			background: #ffffff;
			width: 100%;
			max-width: 800px;
			padding: 48px;
			border-radius: 16px;
			box-shadow: 0 10px 25px rgba(0,0,0,0.05);
			position: relative;
			border: 1px solid var(--border);
		}
		.header {
			display: flex;
			justify-content: space-between;
			align-items: flex-start;
			border-bottom: 2px solid var(--border);
			padding-bottom: 24px;
			margin-bottom: 32px;
		}
		.company-title {
			font-size: 24px;
			font-weight: 800;
			color: var(--primary);
			letter-spacing: -0.02em;
			text-transform: uppercase;
		}
		.company-sub {
			font-size: 13px;
			color: var(--text-muted);
			margin-top: 4px;
			font-weight: 500;
		}
		.receipt-meta {
			text-align: right;
		}
		.meta-label {
			font-size: 11px;
			font-weight: 800;
			text-transform: uppercase;
			color: var(--text-muted);
			letter-spacing: 0.05em;
		}
		.meta-value {
			font-size: 15px;
			font-weight: 700;
			color: var(--primary);
			margin-bottom: 8px;
		}
		.meta-date {
			font-size: 12px;
			color: var(--text-muted);
		}
		.details-row {
			display: grid;
			grid-template-columns: 1fr 1fr;
			gap: 40px;
			margin-bottom: 32px;
		}
		.details-column h3 {
			font-size: 12px;
			font-weight: 800;
			text-transform: uppercase;
			color: var(--text-muted);
			letter-spacing: 0.05em;
			margin-bottom: 12px;
			border-bottom: 1px solid var(--border);
			padding-bottom: 6px;
		}
		.details-text {
			font-size: 14px;
			line-height: 1.6;
			color: var(--primary);
			font-weight: 500;
		}
		.items-table {
			width: 100%;
			border-collapse: collapse;
			margin-bottom: 32px;
		}
		.items-table th {
			background: var(--bg-light);
			color: var(--text-muted);
			font-size: 11px;
			font-weight: 800;
			text-transform: uppercase;
			letter-spacing: 0.05em;
			padding: 12px 16px;
			text-align: left;
			border-bottom: 2px solid var(--border);
		}
		.items-table td {
			padding: 14px 16px;
			border-bottom: 1px solid var(--border);
			font-size: 14px;
			color: var(--primary);
			font-weight: 500;
		}
		.items-table .text-right {
			text-align: right;
		}
		.summary-section {
			display: flex;
			justify-content: space-between;
			align-items: flex-start;
			border-top: 2px solid var(--border);
			padding-top: 24px;
			margin-bottom: 40px;
		}
		.payment-summary {
			max-width: 400px;
		}
		.payment-summary h4 {
			font-size: 12px;
			font-weight: 800;
			text-transform: uppercase;
			color: var(--text-muted);
			letter-spacing: 0.05em;
			margin-bottom: 12px;
		}
		.payment-field {
			display: flex;
			gap: 12px;
			font-size: 14px;
			margin-bottom: 6px;
			font-weight: 600;
		}
		.payment-field-label {
			color: var(--text-muted);
			width: 120px;
		}
		.payment-status-badge {
			display: inline-block;
			font-weight: 800;
			font-size: 12px;
			letter-spacing: 0.05em;
			margin-top: 8px;
			text-transform: uppercase;
		}
		.status-paid { color: #10b981; }
		.status-partial { color: #f97316; }
		.status-unpaid { color: #ef4444; }
		.payment-note {
			font-size: 12px;
			color: var(--text-muted);
			margin-top: 8px;
			line-height: 1.4;
			font-style: italic;
		}
		.financials-summary {
			width: 280px;
		}
		.financial-row {
			display: flex;
			justify-content: space-between;
			font-size: 14px;
			margin-bottom: 8px;
			font-weight: 600;
		}
		.financial-row.grand-total {
			font-size: 18px;
			font-weight: 800;
			color: var(--primary);
			border-top: 1px solid var(--border);
			padding-top: 12px;
			margin-top: 8px;
		}
		.financial-row.grand-total .val {
			color: var(--accent);
		}
		.footer {
			border-top: 1px dashed var(--border);
			padding-top: 24px;
			display: flex;
			justify-content: space-between;
			align-items: flex-end;
		}
		.footer-left {
			font-size: 11px;
			color: var(--text-muted);
			line-height: 1.5;
		}
		.footer-right {
			text-align: right;
		}
		.auth-label {
			font-size: 10px;
			font-weight: 700;
			color: var(--text-muted);
			text-transform: uppercase;
			letter-spacing: 0.05em;
		}
		.auth-name {
			font-size: 13px;
			font-weight: 800;
			color: var(--primary);
			margin-top: 4px;
		}
		.system-note {
			text-align: center;
			font-size: 11px;
			color: var(--text-muted);
			margin-top: 32px;
			border-top: 1px solid var(--border);
			padding-top: 16px;
		}
		@media print {
			body {
				background-color: #ffffff;
				padding: 0;
			}
			.receipt-container {
				border: none;
				box-shadow: none;
				padding: 0;
				max-width: 100%;
			}
			* {
				-webkit-print-color-adjust: exact;
				print-color-adjust: exact;
			}
		}
	</style>
</head>
<body>
	<div class="receipt-container">
		<div class="header">
			<div>
				<h1 class="company-title">Montejo's Lechon & Food Trays</h1>
				<p class="company-sub">Argao, Cebu • Cel. No. 09763146889 / 09760721404</p>
			</div>
			<div class="receipt-meta">
				<div class="meta-label">Receipt No.</div>
				<div class="meta-value">${e.id.replace("ORD-","20260608-")}</div>
				<div class="meta-label">Issued</div>
				<div class="meta-date">${e.date}</div>
			</div>
		</div>

		<div class="details-row">
			<div class="details-column">
				<h3>Billed To</h3>
				<div class="details-text">
					<p>${e.customer}</p>
					<p>${e.address||"N/A"}</p>
					<p>${e.contact||"N/A"}</p>
				</div>
			</div>
			<div class="details-column">
				<h3>Order Details</h3>
				<div class="details-text">
					<p><strong>Fulfillment:</strong> ${e.fulfillmentType||"Delivery"}</p>
					<p><strong>Delivery Date:</strong> ${e.deliveryDateTime||"N/A"}</p>
					<p><strong>Status:</strong> ${e.status}</p>
				</div>
			</div>
		</div>

		<table class="items-table">
			<thead>
				<tr>
					<th>Item Description</th>
					<th class="text-right" style="width: 80px;">Qty</th>
					<th class="text-right" style="width: 120px;">Price</th>
					<th class="text-right" style="width: 150px;">Total</th>
				</tr>
			</thead>
			<tbody>
				${e.items.map(s=>{const u=s.customInclusions&&s.customInclusions.length>0?`
						<div style="margin-top: 4px; font-size: 11px; color: var(--text-muted); font-style: italic; line-height: 1.4;">
							<strong>Custom Inclusions:</strong> ${s.customInclusions.join(", ")}
						</div>
					`:"";return`
						<tr>
							<td>
								<div style="font-weight: 600;">${s.name}</div>
								${u}
							</td>
							<td class="text-right">${s.quantity}</td>
							<td class="text-right">₱${s.price.toLocaleString("en-US",{minimumFractionDigits:2})}</td>
							<td class="text-right">₱${s.total.toLocaleString("en-US",{minimumFractionDigits:2})}</td>
						</tr>
					`}).join("")}
			</tbody>
		</table>

		<div class="summary-section">
			<div class="payment-summary">
				<h4>Payment Summary</h4>
				<div class="payment-field">
					<span class="payment-field-label">Downpayment:</span>
					<span>₱${e.downpayment.toLocaleString("en-US",{minimumFractionDigits:2})}</span>
				</div>
				<div class="payment-field">
					<span class="payment-field-label">Balance:</span>
					<span style="color: ${e.balance>0?"#f97316":"inherit"}">₱${e.balance.toLocaleString("en-US",{minimumFractionDigits:2})}${e.status==="Completed"?" (Settled)":""}</span>
				</div>
				<div class="payment-status-badge ${r}">
					${a}
				</div>
				<p class="payment-note">${o}</p>
			</div>

			<div class="financials-summary">
				<div class="financial-row">
					<span class="label">Subtotal:</span>
					<span class="val">₱${i.toLocaleString("en-US",{minimumFractionDigits:2})}</span>
				</div>
				<div class="financial-row">
					<span class="label">Delivery/Meetup Fee:</span>
					<span class="val">₱${n.toLocaleString("en-US",{minimumFractionDigits:2})}</span>
				</div>
				<div class="financial-row grand-total">
					<span class="label">Total Amount:</span>
					<span class="val">₱${e.total.toLocaleString("en-US",{minimumFractionDigits:2})}</span>
				</div>
			</div>
		</div>

		<div class="footer">
			<div class="footer-left">
				<p>For inquiries, please contact the numbers above.</p>
				<p>Thank you for choosing Montejo's!</p>
			</div>
			<div class="footer-right">
				<div class="auth-label">Authorized by</div>
				<div class="auth-name">MONTEJO'S LECHON & FOOD TRAYS</div>
			</div>
		</div>

		<div class="system-note">
			This is a system-generated e-receipt. No physical signature is required.
		</div>
	</div>
	<script>
		window.onload = function() {
			setTimeout(() => {
				window.print();
			}, 300);
		}
	<\/script>
</body>
</html>
		`;l.document.open(),l.document.write(d),l.document.close()}function k(t){let e=document.getElementById("toast-container");e||(e=document.createElement("div"),e.id="toast-container",e.style.position="fixed",e.style.bottom="24px",e.style.right="24px",e.style.zIndex="9999",e.style.display="flex",e.style.flexDirection="column",e.style.gap="8px",document.body.appendChild(e));const n=document.createElement("div");n.className="glass-panel",n.style.background="rgba(16, 185, 129, 0.15)",n.style.border="1px solid rgba(16, 185, 129, 0.4)",n.style.color="#10b981",n.style.padding="12px 20px",n.style.borderRadius="10px",n.style.fontSize="0.875rem",n.style.fontWeight="600",n.style.boxShadow="0 10px 25px -5px rgba(0, 0, 0, 0.3)",n.style.backdropFilter="blur(10px)",n.style.webkitBackdropFilter="blur(10px)",n.style.transition="all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",n.style.opacity="0",n.style.transform="translateY(20px)",n.textContent=t,e.appendChild(n),n.offsetHeight,n.style.opacity="1",n.style.transform="translateY(0)",setTimeout(()=>{n.style.opacity="0",n.style.transform="translateY(-20px)",setTimeout(()=>{n.remove()},300)},3e3)}function at(){const t=document.getElementById("create-order-form"),e=document.getElementById("food-item"),n=document.getElementById("custom-item-name-group"),i=document.getElementById("custom-item-name"),l=document.getElementById("item-quantity"),a=document.getElementById("item-price"),r=document.getElementById("add-to-ticket-btn"),o=document.getElementById("order-downpayment"),d=document.getElementById("customize-item-toggle-group"),s=document.getElementById("customize-item-checkbox"),u=document.getElementById("item-customization-section"),c=document.getElementById("custom-inclusions-list"),p=document.getElementById("btn-add-inclusion");let m=[],y="Full";const g=f=>{y=f;const w=document.querySelector('input[name="tray-size"][value="Full"]'),E=document.querySelector('input[name="tray-size"][value="Half"]'),B=document.getElementById("toggle-size-full"),S=document.getElementById("toggle-size-half");B?.classList.toggle("active",f==="Full"),S?.classList.toggle("active",f==="Half"),w&&(w.checked=f==="Full"),E&&(E.checked=f==="Half");const L=e.options[e.selectedIndex];if(L&&L.value&&L.value!=="Custom Item"){const $=parseFloat(L.getAttribute("data-price")||"0");if(f==="Half"){const M=$/2+50;a.value=M.toFixed(2)}else a.value=$.toFixed(2)}},x=document.getElementById("toggle-size-full"),I=document.getElementById("toggle-size-half");x?.addEventListener("click",()=>g("Full")),I?.addEventListener("click",()=>g("Half"));const v=()=>{c&&(c.innerHTML=m.map((f,w)=>`
				<div class="inclusion-edit-row" style="display: flex; align-items: center; gap: 8px;">
					<input type="text" class="custom-inclusion-input" data-idx="${w}" value="${f.replace(/"/g,"&quot;")}" placeholder="Inclusion item description..." style="flex: 1; padding: 8px 12px; font-size: 0.85rem; border-radius: 6px; border: 1px solid var(--border-color); background: rgba(0,0,0,0.3); color: var(--text-primary);" />
					<button type="button" class="btn-delete-inclusion" data-idx="${w}" style="background: transparent; border: none; color: #ef4444; cursor: pointer; display: flex; align-items: center; justify-content: center; padding: 6px; transition: color 0.2s;" title="Remove Inclusion">
						<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
					</button>
				</div>
			`).join(""),c.querySelectorAll(".custom-inclusion-input").forEach(f=>{f.addEventListener("input",w=>{const E=w.currentTarget.getAttribute("data-idx");if(E!==null){const B=parseInt(E);m[B]=w.currentTarget.value}})}),c.querySelectorAll(".btn-delete-inclusion").forEach(f=>{f.addEventListener("click",w=>{const E=w.currentTarget.getAttribute("data-idx");if(E!==null){const B=parseInt(E);m.splice(B,1),v()}})}))};p?.addEventListener("click",()=>{m.push(""),v()}),s?.addEventListener("change",()=>{if(s.checked){if(u&&(u.style.display="block"),m.length===0){const f=e.options[e.selectedIndex];m=Fe(f.value)||[]}v()}else u&&(u.style.display="none")});const h=document.getElementById("toggle-owner-label"),P=document.getElementById("toggle-customer-label"),q=document.getElementById("customer-details-section"),D=document.getElementById("submit-btn-text"),K=document.getElementById("customer-name"),de=document.getElementById("customer-contact"),ce=document.getElementById("customer-address"),me=document.getElementById("delivery-date-time"),Le=f=>{se=f,f==="Owner"?(h?.classList.add("active"),P?.classList.remove("active"),q&&(q.style.display="block"),D&&(D.textContent="Submit Order"),K?.setAttribute("required","required"),de?.setAttribute("required","required"),ce?.setAttribute("required","required"),me?.setAttribute("required","required")):(h?.classList.remove("active"),P?.classList.add("active"),q&&(q.style.display="none"),D&&(D.textContent="Generate Customer Link"),K?.removeAttribute("required"),de?.removeAttribute("required"),ce?.removeAttribute("required"),me?.removeAttribute("required"))};h?.addEventListener("click",()=>Le("Owner")),P?.addEventListener("click",()=>Le("Customer"));const Be=document.getElementById("toggle-pickup-label"),Se=document.getElementById("toggle-meetup-label"),Ce=document.getElementById("toggle-delivery-label"),R=document.getElementById("delivery-fee-group"),z=document.getElementById("delivery-fee"),ue=f=>{Z=f;const w=document.querySelector('input[name="fulfillment-type"][value="Pickup"]'),E=document.querySelector('input[name="fulfillment-type"][value="Meetup"]'),B=document.querySelector('input[name="fulfillment-type"][value="Delivery"]');Be?.classList.toggle("active",f==="Pickup"),Se?.classList.toggle("active",f==="Meetup"),Ce?.classList.toggle("active",f==="Delivery"),w&&(w.checked=f==="Pickup"),E&&(E.checked=f==="Meetup"),B&&(B.checked=f==="Delivery"),f==="Pickup"?(R&&(R.style.display="none"),z&&(z.value="0.00")):f==="Meetup"?(R&&(R.style.display="block"),z&&(z.value="50.00")):(R&&(R.style.display="block"),z&&(z.value="100.00")),_(!0)};Be?.addEventListener("click",()=>ue("Pickup")),Se?.addEventListener("click",()=>ue("Meetup")),Ce?.addEventListener("click",()=>ue("Delivery")),z?.addEventListener("input",()=>{_(!1)}),e?.addEventListener("change",()=>{const f=e.options[e.selectedIndex],w=parseFloat(f.getAttribute("data-price")||"0");f.value==="Custom Item"?(n.style.display="block",i.setAttribute("required","required"),a.value="0.00"):(n.style.display="none",i.removeAttribute("required"),i.value="",a.value=w.toFixed(2));const E=e.value,B=["P1 Package (Bilao)","P2 Package (Bilao)","P3 Package (Bilao)","P4 Package (Bilao)","P5 Package (Bilao)","P6 Package (Bilao)"].includes(E),S=document.getElementById("belly-dessert-group"),L=document.getElementById("belly-dessert");S&&L&&(B?(S.style.display="block",L.setAttribute("required","required")):(S.style.display="none",L.removeAttribute("required"),L.selectedIndex=0,S.classList.remove("invalid")));const $=Fe(f.value);$&&$.length>0&&(d&&(d.style.display="block"),s&&(s.checked=!1),u&&(u.style.display="none"),m=[...$],m=[]);const M=f.parentElement,A=M&&M.label&&M.label.startsWith("Food Trays"),H=document.getElementById("foodtray-size-group");H&&(A?(H.style.display="block",g("Full")):(H.style.display="none",g("Full")))}),r?.addEventListener("click",()=>{if(!it())return;const f=e.options[e.selectedIndex];let E=f.value==="Custom Item"?i.value.trim():f.value;const B=["P1 Package (Bilao)","P2 Package (Bilao)","P3 Package (Bilao)","P4 Package (Bilao)","P5 Package (Bilao)","P6 Package (Bilao)"].includes(f.value),S=document.getElementById("belly-dessert");B&&S&&S.value&&(E=`${E} [Dessert: ${S.value}]`);const L=f.parentElement;L&&L.label&&L.label.startsWith("Food Trays")&&(E=`${E} (${y==="Half"?"Half Tray":"Full Tray"})`);const M=parseInt(l.value)||1,A=parseFloat(a.value)||0,H=M*A,pe=s&&s.checked?m.filter(W=>W.trim()!==""):void 0,ye={name:E,quantity:M,price:A,total:parseFloat(H.toFixed(2)),customInclusions:pe};N.push(ye),Ie(),_(!0),e.selectedIndex=0,n.style.display="none",i.value="",l.value="1",a.value="";const U=document.getElementById("belly-dessert-group");U&&S&&(U.style.display="none",S.removeAttribute("required"),S.selectedIndex=0,U.classList.remove("invalid")),s&&(s.checked=!1),d&&(d.style.display="none"),u&&(u.style.display="none"),m=[];const ee=document.getElementById("foodtray-size-group");ee&&(ee.style.display="none",g("Full")),e.parentElement?.parentElement?.classList.remove("invalid"),n.classList.remove("invalid"),a.parentElement?.parentElement?.classList.remove("invalid")}),o?.addEventListener("input",()=>{_(!1)}),t?.addEventListener("submit",async f=>{if(f.preventDefault(),!ot())return;let w=0;b.forEach(F=>{const V=parseInt(F.id.replace("ORD-",""));V>w&&(w=V)});const B=`ORD-${(w+1).toString().padStart(3,"0")}`,S=document.getElementsByName("order-status");let L="Pending";S.forEach(F=>{F.checked&&(L=F.value)});const $=new Date,M=`${$.getFullYear()}-${($.getMonth()+1).toString().padStart(2,"0")}-${$.getDate().toString().padStart(2,"0")} ${$.getHours().toString().padStart(2,"0")}:${$.getMinutes().toString().padStart(2,"0")}`,A=se==="Customer",H=A?"Pending Customer Details":K.value.trim(),pe=A?"":ce.value.trim(),ye=A?"":de.value.trim(),U=A?"":me.value,ee=U?U.replace("T"," "):"",W=z&&parseFloat(z.value)||0,$e=N.reduce((F,V)=>F+V.total,0)+W,Te=parseFloat(o.value)||0,je=parseFloat(($e-Te).toFixed(2)),C={id:B,date:M,customer:H,address:pe,contact:ye,deliveryDateTime:ee,items:[...N],total:parseFloat($e.toFixed(2)),downpayment:parseFloat(Te.toFixed(2)),balance:je,status:L,fulfillmentType:Z,deliveryFee:W};try{const F=await fetch("/.netlify/functions/create-order",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({order:{id:C.id,date:C.date,customer:C.customer,address:C.address,contact:C.contact,deliveryDateTime:C.deliveryDateTime||null,fulfillmentType:C.fulfillmentType??"Delivery",status:C.status,total:C.total,downpayment:C.downpayment,balance:C.balance,deliveryFee:C.deliveryFee??0},items:C.items})}),V=await F.json().catch(()=>({}));if(!F.ok){console.error("Failed to save order (server):",V),k("Failed to save order.");return}}catch(F){console.error("Failed to save order:",F),k("Failed to save order.");return}b.unshift(C),j(),document.getElementById("order-modal-overlay")?.classList.remove("active"),A?et(B):k("Order created successfully!"),ze()})}function it(){let t=!0;const e=document.getElementById("food-item"),n=e?.parentElement?.parentElement;e.value?n?.classList.remove("invalid"):(n?.classList.add("invalid"),t=!1);const i=document.getElementById("custom-item-name-group"),l=document.getElementById("custom-item-name");i&&i.style.display==="block"&&(l.value.trim()?i.classList.remove("invalid"):(i.classList.add("invalid"),t=!1));const a=document.getElementById("belly-dessert-group"),r=document.getElementById("belly-dessert");a&&a.style.display==="block"&&(r.value?a.classList.remove("invalid"):(a.classList.add("invalid"),t=!1));const o=document.getElementById("item-price"),d=o?.parentElement?.parentElement,s=parseFloat(o.value);return isNaN(s)||s<0?(d?.classList.add("invalid"),t=!1):d?.classList.remove("invalid"),t}function Ie(){const t=document.getElementById("ticket-items-list");if(t){if(N.length===0){t.innerHTML=`
				<div class="ticket-empty-state" id="ticket-empty-state">
					No items added to this ticket yet.
				</div>
			`;return}t.innerHTML=N.map((e,n)=>{const i=e.customInclusions&&e.customInclusions.length>0?`
				<div class="ticket-item-customizations" style="margin-top: 4px; padding-left: 12px; font-size: 0.75rem; color: var(--accent-primary); border-left: 2px solid var(--accent-primary);">
					<div style="font-weight: 700; text-transform: uppercase; font-size: 0.65rem; margin-bottom: 2px;">Custom Inclusions:</div>
					<ul style="margin: 0; padding-left: 12px; list-style-type: disc; color: var(--text-secondary);">
						${e.customInclusions.map(l=>`<li>${l}</li>`).join("")}
					</ul>
				</div>
			`:"";return`
				<div class="ticket-item-wrapper" style="border-bottom: 1px solid rgba(255, 255, 255, 0.03); padding-bottom: 8px; margin-bottom: 8px;">
					<div class="ticket-item-row" style="border-bottom: none; padding-bottom: 0;">
						<div class="ticket-item-info">
							<span class="ticket-item-name">${e.name}</span>
							<span class="ticket-item-meta">${e.quantity}x @ ₱${e.price.toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2})}</span>
						</div>
						<div class="ticket-item-right" style="display: flex; align-items: center; gap: 12px;">
							<span class="ticket-item-total">₱${e.total.toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2})}</span>
							<button type="button" class="btn-remove-item" data-idx="${n}" title="Remove Item">
								<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
							</button>
						</div>
					</div>
					${i}
				</div>
			`}).join(""),t.querySelectorAll(".btn-remove-item").forEach(e=>{e.addEventListener("click",n=>{const i=n.currentTarget.getAttribute("data-idx");if(i!==null){const l=parseInt(i);N.splice(l,1),Ie(),_(!0)}})})}}function _(t=!0){const e=document.getElementById("order-downpayment"),n=document.getElementById("delivery-fee"),i=document.getElementById("total-val"),l=document.getElementById("downpayment-val"),a=document.getElementById("balance-val");if(!i||!l||!a||!e)return;const r=N.reduce((c,p)=>c+p.total,0),o=n&&parseFloat(n.value)||0,d=r+o;t&&(e.value=(d*.5).toFixed(2));const s=parseFloat(e.value)||0,u=Math.max(0,d-s);i.textContent=`₱${d.toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2})}`,l.textContent=`₱${s.toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2})}`,a.textContent=`₱${u.toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2})}`}function ot(){let t=!0;if(se==="Owner"){const o=document.getElementById("customer-name"),d=o?.parentElement?.parentElement;o&&!o.value.trim()?(d?.classList.add("invalid"),t=!1):d?.classList.remove("invalid");const s=document.getElementById("customer-contact"),u=s?.parentElement?.parentElement;s&&!s.value.trim()?(u?.classList.add("invalid"),t=!1):u?.classList.remove("invalid");const c=document.getElementById("customer-address"),p=c?.parentElement?.parentElement;c&&!(Z==="Pickup")&&!c.value.trim()?(p?.classList.add("invalid"),t=!1):p?.classList.remove("invalid");const y=document.getElementById("delivery-date-time"),g=y?.parentElement?.parentElement;y&&!y.value?(g?.classList.add("invalid"),t=!1):g?.classList.remove("invalid")}const e=document.getElementById("delivery-fee"),n=e?.parentElement?.parentElement;if(e&&Z!=="Pickup"){const o=parseFloat(e.value);isNaN(o)||o<0?(n?.classList.add("invalid"),t=!1):n?.classList.remove("invalid")}const i=document.getElementById("order-downpayment"),l=i?.parentElement?.parentElement,a=parseFloat(i?.value);i&&(isNaN(a)||a<0)?(l?.classList.add("invalid"),t=!1):l?.classList.remove("invalid");const r=document.querySelector(".ticket-items-container");return N.length===0?(r?.classList.add("invalid"),t=!1):r?.classList.remove("invalid"),t}function ze(){const t=document.getElementById("create-order-form");t&&t.reset();const e=document.getElementById("custom-item-name-group");e&&(e.style.display="none");const n=document.getElementById("foodtray-size-group");if(n){n.style.display="none";const v=document.querySelector('input[name="tray-size"][value="Full"]');v&&(v.checked=!0);const h=document.getElementById("toggle-size-full"),P=document.getElementById("toggle-size-half");h?.classList.add("active"),P?.classList.remove("active")}const i=document.getElementById("belly-dessert-group"),l=document.getElementById("belly-dessert");i&&l&&(i.style.display="none",l.removeAttribute("required"),l.selectedIndex=0),N=[],Ie(),se="Owner";const a=document.getElementById("toggle-owner-label"),r=document.getElementById("toggle-customer-label"),o=document.getElementById("customer-details-section"),d=document.getElementById("submit-btn-text"),s=document.getElementById("customer-name"),u=document.getElementById("customer-contact"),c=document.getElementById("customer-address"),p=document.getElementById("delivery-date-time");a?.classList.add("active"),r?.classList.remove("active"),o&&(o.style.display="block"),d&&(d.textContent="Submit Order"),s?.setAttribute("required","required"),u?.setAttribute("required","required"),c?.setAttribute("required","required"),p?.setAttribute("required","required"),document.querySelectorAll(".form-group").forEach(v=>{v.classList.remove("invalid")}),document.querySelector(".ticket-items-container")?.classList.remove("invalid");const m=document.getElementById("toggle-pickup-label"),y=document.getElementById("toggle-meetup-label"),g=document.getElementById("toggle-delivery-label"),x=document.getElementById("delivery-fee-group"),I=document.getElementById("delivery-fee");if(m&&y&&g&&x&&I){Z="Pickup";const v=document.querySelector('input[name="fulfillment-type"][value="Pickup"]');v&&(v.checked=!0),m.classList.add("active"),y.classList.remove("active"),g.classList.remove("active"),x.style.display="none",I.value="0.00"}_(!0)}const st={dashboard:"Order Dashboard","order-history":"Order History",analytics:"Analytics","live-kitchen":"Live Kitchen",settings:"Settings"};let ae=null;function rt(t){document.querySelectorAll(".view-container").forEach(l=>l.style.display="none");const e=document.getElementById(`view-${t}`);e&&(e.style.display="flex"),document.querySelectorAll(".nav-item").forEach(l=>l.classList.remove("active")),document.querySelector(`.nav-item[data-view="${t}"]`)?.classList.add("active");const n=document.getElementById("page-title");n&&(n.textContent=st[t]||t);const i=document.getElementById("open-order-modal-btn");i&&(i.style.display=t==="dashboard"?"":"none"),t!=="live-kitchen"&&ae&&(clearInterval(ae),ae=null),t==="order-history"&&X(),t==="analytics"&&ct(),t==="live-kitchen"&&(re(),ae=setInterval(re,3e4)),t==="settings"&&mt()}function lt(){document.querySelectorAll(".nav-item[data-view]").forEach(t=>{t.addEventListener("click",e=>{e.preventDefault();const n=t.getAttribute("data-view");rt(n)})})}let ge="All",fe="",ve="",be="";function X(){["All","Pending","Preparing","Completed","Cancelled"].forEach(s=>{const u=document.getElementById(`hcount-${s.toLowerCase()}`);u&&(u.textContent=s==="All"?b.length.toString():b.filter(c=>c.status===s).length.toString())});let e=[...b];if(ge!=="All"&&(e=e.filter(s=>s.status===ge)),fe.trim()){const s=fe.toLowerCase();e=e.filter(u=>u.id.toLowerCase().includes(s)||u.customer.toLowerCase().includes(s))}ve&&(e=e.filter(s=>(s.deliveryDateTime||s.date)>=ve)),be&&(e=e.filter(s=>(s.deliveryDateTime||s.date)<=be+"T23:59")),e.sort((s,u)=>u.date.localeCompare(s.date));const n=document.getElementById("history-body"),i=document.getElementById("history-empty");if(!n||!i)return;e.length===0?(n.innerHTML="",i.style.display="flex"):(i.style.display="none",n.innerHTML=e.map(s=>{const u=s.items.map(p=>`<div class="history-item-pill">${p.quantity}x ${p.name}</div>`).join(""),c=`badge-${s.status.toLowerCase()}`;return`<tr>
					<td style="font-weight:700;color:var(--accent-primary)">#${s.id.replace("ORD-","")}</td>
					<td>${s.customer}</td>
					<td><div class="history-items-list">${u}</div></td>
					<td style="font-weight:700">₱${s.total.toLocaleString("en-US",{minimumFractionDigits:2})}</td>
					<td style="color:var(--status-preparing)">₱${s.downpayment.toLocaleString("en-US",{minimumFractionDigits:2})}</td>
					<td style="color:var(--accent-primary)">₱${s.balance.toLocaleString("en-US",{minimumFractionDigits:2})}${s.status==="Completed"?' <span style="font-size:0.7rem;color:#10b981;font-weight:800;display:block;">Settled</span>':""}</td>
					<td style="color:var(--text-secondary);font-size:0.8rem">${s.deliveryDateTime||s.date}</td>
					<td><span class="status-badge ${c}">${s.status}</span></td>
					<td><button class="action-btn btn-view-details" data-id="${s.id}" title="View Details" style="padding:6px">
						<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0z"/><circle cx="12" cy="12" r="3"/></svg>
					</button></td>
				</tr>`}).join(""),n.querySelectorAll(".btn-view-details").forEach(s=>{s.addEventListener("click",u=>{const c=u.currentTarget.getAttribute("data-id");c&&Ee(c)})}));const l=document.getElementById("history-tabs");l&&!l.dataset.bound&&(l.dataset.bound="1",l.querySelectorAll(".filter-tab").forEach(s=>{s.addEventListener("click",()=>{l.querySelectorAll(".filter-tab").forEach(u=>u.classList.remove("active")),s.classList.add("active"),ge=s.getAttribute("data-status")||"All",X()})}));const a=document.getElementById("history-search");a&&!a.dataset.bound&&(a.dataset.bound="1",a.addEventListener("input",()=>{fe=a.value,X()}));const r=document.getElementById("history-from"),o=document.getElementById("history-to");r&&!r.dataset.bound&&(r.dataset.bound="1",r.addEventListener("change",()=>{ve=r.value,X()})),o&&!o.dataset.bound&&(o.dataset.bound="1",o.addEventListener("change",()=>{be=o.value,X()}));const d=document.getElementById("export-csv-btn");d&&!d.dataset.bound&&(d.dataset.bound="1",d.addEventListener("click",()=>dt(e)))}function dt(t){const n=[["Order #","Customer","Items","Total","Downpayment","Balance","Delivery Date","Status"].join(","),...t.map(a=>[a.id,`"${a.customer}"`,`"${a.items.map(r=>`${r.quantity}x ${r.name}`).join("; ")}"`,a.total,a.downpayment,a.balance,`"${a.deliveryDateTime||a.date}"`,a.status].join(","))],i=new Blob([n.join(`
`)],{type:"text/csv"}),l=document.createElement("a");l.href=URL.createObjectURL(i),l.download=`orders_${new Date().toISOString().slice(0,10)}.csv`,l.click()}function ct(){const t=b.filter(c=>c.status!=="Cancelled"),e=t.filter(c=>c.status==="Completed"),n=e.reduce((c,p)=>c+p.total,0),i=e.length?n/e.length:0,l=b.length?Math.round(e.length/b.length*100):0,a=t.length?Math.max(...t.map(c=>c.total)):0,r=document.getElementById("analytics-summary");r&&(r.innerHTML=[{label:"Total Revenue",value:`₱${n.toLocaleString("en-US",{minimumFractionDigits:2})}`,sub:"from completed orders"},{label:"Completion Rate",value:`${l}%`,sub:`${e.length} of ${b.length} orders`},{label:"Avg Order Value",value:`₱${i.toLocaleString("en-US",{minimumFractionDigits:2})}`,sub:"completed orders"},{label:"Highest Order",value:`₱${a.toLocaleString("en-US",{minimumFractionDigits:2})}`,sub:"single order"}].map(c=>`<div class="analytic-card"><span class="a-label">${c.label}</span><span class="a-value">${c.value}</span><span class="a-sub">${c.sub}</span></div>`).join(""));const o=document.getElementById("revenue-bar-chart");if(o){const c=t.length?Math.max(...t.map(m=>m.total)):1,p={Pending:"#f59e0b",Preparing:"#f97316",Completed:"#10b981",Cancelled:"#ef4444"};o.innerHTML=t.slice(-20).map(m=>{const y=Math.max(4,Math.round(m.total/c*140)),g=p[m.status]||"#d92b3a";return`<div class="bar-wrap" title="${m.id}: ₱${m.total.toLocaleString()}">
					<div class="bar-fill" style="height:${y}px;background:${g}"></div>
					<span class="bar-id">${m.id.replace("ORD-","")}</span>
				</div>`}).join("")||'<span style="color:var(--text-muted);font-size:0.8rem;padding:16px">No orders yet.</span>'}const d=document.getElementById("status-donut"),s=document.getElementById("donut-legend");if(d&&s){const c={Pending:{count:0,color:"#f59e0b"},Preparing:{count:0,color:"#f97316"},Completed:{count:0,color:"#10b981"},Cancelled:{count:0,color:"#ef4444"}};b.forEach(h=>{c[h.status]&&c[h.status].count++});const p=b.length||1;let m=25;const y=40,g=60,x=60,I=2*Math.PI*y,v=Object.entries(c).filter(([,h])=>h.count>0).map(([h,P])=>{const q=P.count/p,D=I*q,K=`<circle cx="${g}" cy="${x}" r="${y}" fill="none" stroke="${P.color}" stroke-width="14" stroke-dasharray="${D} ${I-D}" stroke-dashoffset="${-I*(m/100)}" style="transform-origin:center;transform:rotate(-90deg)"/>`;return m+=q*100,{seg:K,label:h,v:P}});d.innerHTML=`<svg width="120" height="120" viewBox="0 0 120 120">${v.map(h=>h.seg).join("")}<circle cx="${g}" cy="${x}" r="26" fill="var(--bg-primary)"/><text x="${g}" y="${x+2}" text-anchor="middle" dominant-baseline="middle" fill="var(--text-primary)" font-size="13" font-weight="800">${b.length}</text><text x="${g}" y="${x+16}" text-anchor="middle" dominant-baseline="middle" fill="var(--text-muted)" font-size="7">orders</text></svg>`,s.innerHTML=v.map(h=>`<div class="legend-item"><div class="legend-dot" style="background:${h.v.color}"></div><span>${h.label}: <strong>${h.v.count}</strong></span></div>`).join("")}const u=document.getElementById("analytics-top-items");if(u){const c={};t.forEach(m=>m.items.forEach(y=>{c[y.name]||(c[y.name]={qty:0,rev:0}),c[y.name].qty+=y.quantity,c[y.name].rev+=y.total}));const p=Object.entries(c).sort((m,y)=>y[1].qty-m[1].qty).slice(0,6);u.innerHTML=p.map(([m,y],g)=>`<div class="analytics-top-item">
				<span class="ati-rank">#${g+1}</span>
				<span class="ati-name">${m}</span>
				<span class="ati-qty">${y.qty} sold</span>
				<span class="ati-rev">₱${y.rev.toLocaleString("en-US",{minimumFractionDigits:2})}</span>
			</div>`).join("")||'<span style="color:var(--text-muted);font-size:0.8rem;padding:8px">No sales data.</span>'}}function re(){const t=b.filter(y=>y.status==="Pending"||y.status==="Preparing").sort((y,g)=>y.date.localeCompare(g.date)),e=document.getElementById("kitchen-pending-count"),n=document.getElementById("kitchen-preparing-count"),i=t.filter(y=>y.status==="Pending"),l=t.filter(y=>y.status==="Preparing");e&&(e.textContent=`${i.length} Pending`),n&&(n.textContent=`${l.length} Preparing`);const a=document.getElementById("kcol-pending-count"),r=document.getElementById("kcol-preparing-count");a&&(a.textContent=i.length.toString()),r&&(r.textContent=l.length.toString());const o=document.getElementById("kds-pending-body"),d=document.getElementById("kds-preparing-body"),s=document.getElementById("kds-pending-empty"),u=document.getElementById("kds-preparing-empty"),c=document.querySelector(".kds-board"),p=document.getElementById("kitchen-empty");if(!o||!d||!s||!u||!c||!p)return;if(t.length===0)c.style.display="none",p.style.display="flex";else{if(c.style.display="grid",p.style.display="none",i.length===0)o.innerHTML="",s.style.display="flex";else{s.style.display="none";const g=new Date;o.innerHTML=i.map(x=>Pe(x,g)).join("")}if(l.length===0)d.innerHTML="",u.style.display="flex";else{u.style.display="none";const g=new Date;d.innerHTML=l.map(x=>Pe(x,g)).join("")}const y=g=>{g.querySelectorAll("[data-action]").forEach(x=>{x.addEventListener("click",I=>{const v=I.currentTarget.getAttribute("data-id"),h=I.currentTarget.getAttribute("data-action");if(h==="details"){Ee(v);return}h==="prepare"&&Y(v,"Preparing"),h==="complete"&&Y(v,"Completed"),h==="cancel"&&Y(v,"Cancelled"),re(),j()})})};y(o),y(d)}const m=document.getElementById("kitchen-refresh-btn");m&&!m.dataset.bound&&(m.dataset.bound="1",m.addEventListener("click",async()=>{await qe(),re()}))}function Pe(t,e){const n=new Date(t.date.replace(" ","T")),i=isNaN(n.getTime())?0:Math.floor((e.getTime()-n.getTime())/6e4),l=i<60?`${i}m ago`:`${Math.floor(i/60)}h ${i%60}m ago`,a=t.items.map(o=>{const d=o.customInclusions&&o.customInclusions.length>0?`
				<div class="kcard-item-inclusions" style="font-size: 0.7rem; color: var(--accent-primary); margin-top: 2px; padding-left: 8px; border-left: 1.5px solid var(--accent-primary); font-style: italic; opacity: 0.9;">
					+ ${o.customInclusions.join(", ")}
				</div>
			`:"";return`
				<div style="margin-bottom: 6px;">
					<div class="kcard-item" style="margin-bottom: 0;"><strong>${o.quantity}x</strong> ${o.name}</div>
					${d}
				</div>
			`}).join(""),r=t.status==="Pending";return`<div class="kitchen-card status-${t.status.toLowerCase()}">
			<div class="kcard-header">
				<span class="kcard-id">#${t.id.replace("ORD-","")}</span>
				<div style="display:flex;align-items:center;gap:8px">
					<span class="kcard-timer">${l}</span>
					<button class="kcard-btn-details" data-id="${t.id}" data-action="details" title="View Full Details">
						<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0z"/><circle cx="12" cy="12" r="3"/></svg>
					</button>
				</div>
			</div>
			<div class="kcard-customer">👤 ${t.customer==="Pending Customer Details"?"Customer TBD":t.customer}</div>
			<div class="kcard-items">${a}</div>
			<div class="kcard-actions">
				${r?`<button class="kcard-btn kcard-btn-prepare" data-id="${t.id}" data-action="prepare">▶ Prepare</button>`:""}
				${r?"":`<button class="kcard-btn kcard-btn-complete" data-id="${t.id}" data-action="complete">✓ Complete</button>`}
				<button class="kcard-btn kcard-btn-cancel" data-id="${t.id}" data-action="cancel">✕ Cancel</button>
			</div>
		</div>`}const Oe="flavorflow_settings",Me={maribankName:"Christy Montejo",maribankNum:"11953471393",gcashName:"Christy Montejo",gcashNum:"09760721404",dpPct:50};function xe(){try{return{...Me,...JSON.parse(localStorage.getItem(Oe)||"{}")}}catch{return{...Me}}}function Ae(t){localStorage.setItem(Oe,JSON.stringify(t))}function mt(){const t=xe();[["s-maribank-name","maribankName"],["s-maribank-num","maribankNum"],["s-gcash-name","gcashName"],["s-gcash-num","gcashNum"],["s-dp-pct","dpPct"]].forEach(([a,r])=>{const o=document.getElementById(a);o&&!o.dataset.bound&&(o.value=String(t[r]))});const n=document.getElementById("save-payment-btn");n&&!n.dataset.bound&&(n.dataset.bound="1",n.addEventListener("click",()=>{const a=xe();a.maribankName=document.getElementById("s-maribank-name")?.value||a.maribankName,a.maribankNum=document.getElementById("s-maribank-num")?.value||a.maribankNum,a.gcashName=document.getElementById("s-gcash-name")?.value||a.gcashName,a.gcashNum=document.getElementById("s-gcash-num")?.value||a.gcashNum,Ae(a),k("Payment info saved!")}));const i=document.getElementById("save-dp-btn");i&&!i.dataset.bound&&(i.dataset.bound="1",i.addEventListener("click",()=>{const a=xe(),r=parseFloat(document.getElementById("s-dp-pct")?.value);!isNaN(r)&&r>=0&&r<=100?(a.dpPct=r,Ae(a),k(`Default downpayment set to ${r}%`)):k("Enter a valid percentage (0–100)")}));const l=document.getElementById("clear-orders-btn");l&&!l.dataset.bound&&(l.dataset.bound="1",l.addEventListener("click",async()=>{if(await Q("Clear ALL orders from the database? This cannot be undone.")){const{error:a}=await le.from("orders").delete().neq("id","");if(a){k("Failed to clear orders.");return}b=[],j(),k("All orders cleared.")}}))}const ut=document.getElementById("theme-toggle-btn"),ie=document.querySelector(".sun-icon"),oe=document.querySelector(".moon-icon");function Ne(t){t==="light"?(ie&&(ie.style.display="none"),oe&&(oe.style.display="block")):(ie&&(ie.style.display="block"),oe&&(oe.style.display="none"))}const pt=document.documentElement.getAttribute("data-theme")||"dark";Ne(pt);ut?.addEventListener("click",()=>{const e=(document.documentElement.getAttribute("data-theme")||"dark")==="dark"?"light":"dark";document.documentElement.setAttribute("data-theme",e),localStorage.setItem("theme",e),Ne(e)});
