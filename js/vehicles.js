// js/vehicles.js
// AutoGuide — Multi-car garage
// Handles: storing multiple vehicles, selecting active vehicle,
//          generating vehicle-specific maintenance steps and product recommendations.

// ── Storage ───────────────────────────────────────────────────────────────────

const VEH_KEY      = 'ag_vehicles_v2';
const VEH_ACTIVE   = 'ag_active_vehicle';

function vehSave(list)      { try { localStorage.setItem(VEH_KEY,    JSON.stringify(list)); } catch {} }
function vehSaveActive(id)  { try { localStorage.setItem(VEH_ACTIVE, id); } catch {} }
function vehLoadAll()       { try { return JSON.parse(localStorage.getItem(VEH_KEY)) || []; } catch { return []; } }
function vehLoadActiveId()  { try { return localStorage.getItem(VEH_ACTIVE) || null; } catch { return null; } }

// ── State ─────────────────────────────────────────────────────────────────────

let garage       = vehLoadAll();
let activeVehId  = vehLoadActiveId();
let editingVehId = null;   // null = new car form, string = editing existing
let vehFormOpen  = false;

function getActiveVehicle() {
  return garage.find(v => v.id === activeVehId) || garage[0] || null;
}

// ── Vehicle-specific maintenance data ────────────────────────────────────────
// Returns { steps, products } tailored to the vehicle for a given topic id.

function getVehicleSteps(topicId, vehicle) {
  if (!vehicle) return null;

  const y    = parseInt(vehicle.year) || 2015;
  const make = (vehicle.make  || '').toLowerCase();
  const eng  = (vehicle.engine || '').toLowerCase();
  const isV8   = eng.includes('v8') || eng.includes('5.') || eng.includes('6.');
  const isV6   = eng.includes('v6') || eng.includes('3.5') || eng.includes('3.6');
  const isDiesel = eng.includes('diesel') || eng.includes('tdi') || eng.includes('cdi');
  const isTruck  = ['f-150','silverado','ram','tacoma','tundra','ranger','colorado','frontier','titan'].some(t => (vehicle.model||'').toLowerCase().includes(t));
  const isOld  = y < 2010;
  const label  = `${vehicle.year} ${vehicle.make} ${vehicle.model}`.trim() || 'your vehicle';

  // ── Oil ──────────────────────────────────────────────────────────────────
  if (topicId === 1) {
    let oilType = '5W-30 full synthetic';
    let oilQty  = '5 quarts';
    let interval = '5,000–7,500 miles';
    let filterBrand = 'Fram Ultra Synthetic XG3614';

    if (isDiesel)                    { oilType = '5W-40 diesel synthetic (e.g. Shell Rotella T6)'; oilQty = '7–8 quarts'; interval = '7,500–10,000 miles'; }
    else if (isV8)                   { oilType = '5W-20 or 5W-30 full synthetic'; oilQty = '6–7 quarts'; interval = '5,000–7,500 miles'; }
    else if (make === 'honda')       { oilType = '0W-20 full synthetic (Honda recommends Genuine Honda or Mobil 1)'; oilQty = '4.4 quarts'; interval = '5,000–7,500 miles'; filterBrand = 'Honda Genuine Oil Filter 15400-PLM-A02'; }
    else if (make === 'toyota')      { oilType = '0W-20 full synthetic'; oilQty = '4.5–5.7 quarts'; interval = '10,000 miles (Toyota Synthetic)'; filterBrand = 'Toyota Genuine Part 04152-YZZA6'; }
    else if (make === 'bmw')         { oilType = '0W-30 or 5W-30 BMW LL-01 approved synthetic'; oilQty = '6.9 quarts'; interval = '10,000–15,000 miles'; filterBrand = 'Mann-Filter HU 816 x'; }
    else if (make === 'mercedes' || make === 'mercedes-benz') { oilType = '5W-40 MB 229.5 approved synthetic'; oilQty = '8.5 quarts'; interval = '10,000 miles'; filterBrand = 'Genuine Mercedes A0001802609'; }
    else if (make === 'ford' && isTruck)  { oilType = '5W-30 full synthetic'; oilQty = '6 quarts'; interval = '7,500 miles'; filterBrand = 'Motorcraft FL-500-S'; }
    else if (make === 'chevrolet' || make === 'gmc') { oilType = isV8 ? '0W-20 dexos1 Gen2 full synthetic' : '5W-30 dexos1'; oilQty = isV8 ? '8 quarts' : '5 quarts'; filterBrand = 'ACDelco PF63E'; }
    else if (make === 'subaru')      { oilType = '0W-20 full synthetic'; oilQty = '5.1 quarts'; interval = '6,000 miles'; filterBrand = 'Subaru OEM SOA635071'; }
    else if (make === 'volkswagen' || make === 'vw') { oilType = '5W-40 VW 502/505 approved synthetic'; oilQty = '4.7 quarts'; interval = '10,000 miles'; filterBrand = 'Mann-Filter HU 711/51 x'; }
    else if (isOld) { oilType = '5W-30 conventional or synthetic blend'; interval = '3,000–5,000 miles'; }

    return {
      steps: [
        `Warm up the ${label} engine for 2–3 minutes, then park on a level surface and turn off the engine.`,
        `Wait 5 minutes for oil to drain back. Place your drain pan under the oil drain plug — on the ${label} it's located on the bottom of the oil pan toward the rear.`,
        `Remove the oil fill cap on top of the engine to help oil drain faster.`,
        `Remove the drain plug with the correct socket (commonly 14mm or 17mm). Let all oil drain into the pan.`,
        `Replace the drain plug gasket and reinstall the plug — torque to spec (typically 25–30 ft-lbs).`,
        `Locate and remove the old oil filter. On ${make} vehicles the filter is usually on the ${make === 'honda' ? 'driver side of the engine' : make === 'toyota' ? 'passenger side lower engine block' : 'side or bottom of the engine block'}.`,
        `Lightly coat the new ${filterBrand} filter gasket with fresh oil before threading it on. Hand-tighten only — do not use a wrench.`,
        `Add ${oilQty} of ${oilType} through the fill cap on top of the engine.`,
        `Replace the fill cap, start the engine, and let it run for 30 seconds. Check for leaks around the drain plug and filter.`,
        `Turn off engine, wait 2 minutes, then check the dipstick — level should be between Min and Max.`,
        `Reset the oil life monitor: ${make === 'honda' ? 'hold the Select/Reset button on the dash for 10 seconds with ignition on' : make === 'toyota' ? 'press the DISP button on the dash repeatedly until Oil Maintenance Required appears, then hold DISP for 3 seconds' : make === 'ford' ? 'navigate to Settings > Vehicle > Oil Life Reset on the SYNC screen' : 'consult your owner\'s manual for the oil life reset procedure'}.`,
        `Dispose of used oil at a local auto parts store — never pour down a drain.`,
      ],
      products: [
        { name: oilType, why: 'Engine oil — exact spec for ' + label, search: `${oilType} motor oil` },
        { name: filterBrand, why: 'OEM-spec oil filter for ' + label, search: `${filterBrand} oil filter` },
        { name: 'Oil drain pan (5+ qt)', why: 'Catches used oil during drain', search: 'oil drain pan' },
        { name: 'Oil filter wrench', why: 'Removes the old filter without slipping', search: `oil filter wrench ${make}` },
        { name: 'Drain plug gasket/washer', why: 'Prevents leaks after reinstall', search: `${make} ${vehicle.model} drain plug gasket` },
      ],
    };
  }

  // ── Tire pressure ─────────────────────────────────────────────────────────
  if (topicId === 2) {
    const psi = isTruck ? '35–40 PSI' : make === 'bmw' || make === 'mercedes' ? '32–38 PSI' : '32–35 PSI';
    return {
      steps: [
        `Check tire pressure when tyres are cold — the ${label} has likely been parked for at least 1 hour.`,
        `Find the recommended PSI on the sticker inside the driver-side door jamb of your ${label} — typically ${psi} for this vehicle type.`,
        `Remove the valve stem cap from the first tyre and press the pressure gauge firmly onto the stem.`,
        `Read the pressure and compare to the door jamb spec. Repeat for all 4 tyres — and don't forget the spare.`,
        `Use an air compressor or gas station pump to inflate any low tyres. Add air in 5-second bursts, then recheck.`,
        `If a tyre is overinflated, use the small pin on the back of the gauge to release air in small amounts.`,
        `Replace all valve caps when done. Note: the ${label} ${y >= 2008 ? 'has a TPMS (Tyre Pressure Monitoring System) — the dashboard warning light should go off once all tyres are at correct pressure.' : 'may not have TPMS — check pressure manually every month.'}`,
      ],
      products: [
        { name: 'Digital tyre pressure gauge', why: 'More accurate than stick gauges', search: 'digital tire pressure gauge' },
        { name: 'Portable air compressor / inflator', why: 'Inflate tyres at home', search: 'portable tire inflator 12v' },
        { name: 'Valve stem caps (metal)', why: 'Keeps moisture and dirt out', search: 'metal valve stem caps' },
      ],
    };
  }

  // ── Flat tyre ─────────────────────────────────────────────────────────────
  if (topicId === 3) {
    const lugSpec = isTruck ? '100–120 ft-lbs' : make === 'bmw' ? '88–103 ft-lbs' : '80–100 ft-lbs';
    return {
      steps: [
        `Pull safely off the road. Turn on hazard lights and apply the parking brake on your ${label}.`,
        `The spare tyre, jack, and tyre iron are stored ${isTruck ? 'under the bed of the truck (accessed from the rear bumper)' : 'under the floor of the boot/trunk'} on the ${label}.`,
        `Place the jack under the vehicle's designated jack point — on the ${label} look for a reinforced notch along the frame near the flat tyre. Never jack under the body panels.`,
        `Before lifting, loosen (but do not remove) the lug nuts while the flat tyre is still on the ground — turn counter-clockwise.`,
        `Jack the vehicle until the flat tyre is 6 inches off the ground.`,
        `Remove the lug nuts fully and pull off the flat tyre. Mount the spare, aligning the holes with the wheel studs.`,
        `Hand-tighten the lug nuts in a star pattern, then lower the vehicle until the tyre just touches the ground.`,
        `Tighten lug nuts fully in a star pattern to ${lugSpec} torque. Lower vehicle completely and remove jack.`,
        `${isTruck || make === 'bmw' || make === 'mercedes' ? 'This vehicle uses a full-size spare — you can drive normally but get the flat repaired soon.' : 'Compact spares (donuts) are limited to 50 mph and 50–70 miles — get to a tyre shop as soon as possible.'}`,
      ],
      products: [
        { name: 'Torque wrench', why: `Tighten lug nuts to exact ${lugSpec} spec`, search: 'torque wrench 1/2 inch drive' },
        { name: 'Tyre plug repair kit', why: 'Temporarily repair punctures without removing tyre', search: 'tire plug repair kit' },
        { name: 'Portable 12V air compressor', why: 'Inflate the spare or a plugged tyre', search: 'portable tire inflator' },
        { name: 'Road flares or triangle reflectors', why: 'Warn other drivers while you work', search: 'road flares emergency triangle reflectors' },
      ],
    };
  }

  // ── Battery ───────────────────────────────────────────────────────────────
  if (topicId === 4) {
    const battSpec = make === 'honda' ? 'Group 51R, 410–500 CCA' : make === 'toyota' ? 'Group 35, 550 CCA' : make === 'ford' && isTruck ? 'Group 65, 750 CCA' : make === 'bmw' ? 'AGM H8/Group 49, 850 CCA — must be registered with BMW coding tool' : make === 'chevrolet' || make === 'gmc' ? 'Group 78, 600+ CCA' : 'Group 35 or 24F — check owner\'s manual for exact spec';
    return {
      steps: [
        `With the engine off, open the bonnet/hood of your ${label}. The battery is located ${make === 'bmw' ? 'in the boot/trunk on the right side — not under the hood' : make === 'subaru' ? 'at the front-left of the engine bay' : 'at the front of the engine bay, usually on the left or right side'}.`,
        `Set your multimeter to DC voltage (20V range). Touch the red probe to the (+) positive terminal and the black probe to the (–) negative. A healthy battery reads 12.6V or above. Below 12.4V needs attention; below 12.0V the battery is failing.`,
        `Inspect terminals for white or blue corrosion. Mix a tablespoon of baking soda with water and use an old toothbrush to clean them if needed.`,
        `Check the date code stamped on the battery — the first character is the month (A=Jan, B=Feb...) and the second is the year.`,
        `If replacing: disconnect the NEGATIVE (–) terminal first, then the positive (+). Remove any hold-down bracket.`,
        `Install new battery matching spec: ${battSpec}. Connect POSITIVE (+) first, then NEGATIVE (–).`,
        `${make === 'bmw' ? 'IMPORTANT: BMW batteries must be registered using a BMW scan tool or Carly/ISTA app — skipping this step causes charging and electrical issues.' : make === 'honda' || make === 'toyota' ? 'Use a memory-saver tool before disconnecting to preserve radio presets and window calibration.' : 'Your radio presets and idle calibration may need to be reset after disconnecting.'}`,
      ],
      products: [
        { name: battSpec + ' battery', why: 'Exact OEM-spec replacement for ' + label, search: `${make} ${vehicle.model} ${vehicle.year} replacement battery` },
        { name: 'Digital multimeter', why: 'Test battery voltage accurately', search: 'digital multimeter battery test' },
        { name: 'Battery terminal cleaner', why: 'Remove corrosion from terminals', search: 'battery terminal cleaner spray' },
        { name: 'Battery terminal protector spray', why: 'Prevents future corrosion', search: 'battery terminal anti corrosion spray' },
        ...(make === 'bmw' ? [{ name: 'Carly OBD2 adapter + app', why: 'Required to register new BMW battery', search: 'Carly BMW OBD2 adapter' }] : []),
      ],
    };
  }

  // ── Air filter ────────────────────────────────────────────────────────────
  if (topicId === 11) {
    const filterRec =
      make === 'honda'   ? 'Honda Genuine 17220-5LA-A00 or K&N 33-2435' :
      make === 'toyota'  ? 'Toyota Genuine 17801-0P020 or K&N 33-2443' :
      make === 'ford'    ? (isTruck ? 'Motorcraft FA-1883 or K&N 33-2301' : 'Motorcraft FA-1892') :
      make === 'chevrolet' || make === 'gmc' ? 'ACDelco A3579C or K&N 33-2129' :
      make === 'bmw'     ? 'Mann-Filter C 3698/3-2 or K&N 33-2989' :
      make === 'subaru'  ? 'Subaru OEM 16546AA12A or K&N 33-2304' :
                           `K&N or OEM air filter for ${label} (check Rockauto.com for your exact part)`;
    return {
      steps: [
        `Open the bonnet/hood of your ${label}. The air filter box is a ${make === 'honda' ? 'black plastic housing on the right side of the engine bay' : make === 'toyota' ? 'black rectangular box on the driver\'s side' : make === 'ford' && isTruck ? 'large black box on the passenger side near the fender' : 'black plastic box connected to the intake tube'}.`,
        `Unclip the 4 metal clips around the lid of the filter box (some models use screws — use a Phillips screwdriver).`,
        `Lift the lid and remove the old filter. Note which direction the filter faces (the pleated side typically faces up or toward the intake).`,
        `Hold the old filter up to a light source — if you can't see light through it, it's definitely due for replacement.`,
        `Use a shop vacuum to clean any dust and debris from inside the filter housing before installing the new one.`,
        `Insert the new ${filterRec} in the same orientation as the old one.`,
        `Snap the lid back into place and ensure all clips are fully locked. A loose airbox lid can cause engine misfires.`,
        `Check the interval: replace every ${isTruck ? '15,000–20,000 miles' : '12,000–15,000 miles'} or annually, whichever comes first.`,
      ],
      products: [
        { name: filterRec, why: 'Exact replacement air filter for ' + label, search: `${filterRec} air filter` },
        { name: 'Shop vacuum', why: 'Clean dust from filter housing', search: 'shop vacuum wet dry' },
      ],
    };
  }

  // ── Coolant ───────────────────────────────────────────────────────────────
  if (topicId === 6) {
    const coolantType =
      make === 'honda'   ? 'Honda Type 2 Blue coolant (do NOT mix with green/universal)' :
      make === 'toyota'  ? 'Toyota Super Long Life Coolant (pink/red — SLLC)' :
      make === 'ford'    ? 'Motorcraft Orange Specialty Coolant VC-3-B' :
      make === 'chevrolet' || make === 'gmc' ? 'GM DEX-COOL Orange Extended Life coolant' :
      make === 'bmw'     ? 'BMW Genuine Coolant HT-12 (blue) — do not use universal green' :
      make === 'subaru'  ? 'Subaru Super Coolant (blue) — HOAT formula' :
      make === 'volkswagen' || make === 'vw' ? 'VW G13 (purple) or G12++ (pink) coolant' :
                           '50/50 pre-mixed HOAT or OAT coolant — check owner\'s manual for correct type';
    return {
      steps: [
        `Engine must be completely cold before opening the coolant system on your ${label} — wait at least 2 hours after last use.`,
        `Locate the coolant reservoir — a translucent white or coloured plastic tank ${make === 'bmw' ? 'on the left side of the engine bay' : 'connected to the radiator by a rubber hose'}.`,
        `Check the fluid level against the MIN and MAX lines on the outside of the tank.`,
        `If low, remove the reservoir cap and add ${coolantType} until the level reaches MAX.`,
        `If the reservoir is completely empty, you may have a leak. Inspect hoses and connections for cracks or seepage before adding fluid.`,
        `To check the full system: with the engine stone cold, carefully remove the radiator cap (cover with a cloth) and look inside — coolant should be visible at the neck.`,
        `Replace the caps securely. Start the engine and watch the temperature gauge — it should settle at the normal midpoint within 5 minutes. If it climbs toward red, shut off immediately and investigate further.`,
        `Full coolant flush interval: every ${make === 'toyota' ? '100,000 miles (Super Long Life)' : make === 'honda' ? '45,000 miles or 3 years' : '30,000–50,000 miles'}.`,
      ],
      products: [
        { name: coolantType, why: 'OEM-spec coolant for ' + label + ' — wrong type causes corrosion', search: `${coolantType}` },
        { name: 'Coolant test strips', why: 'Check freeze point and pH before flush is needed', search: 'coolant antifreeze test strips' },
        { name: 'Funnel', why: 'Pour coolant without spillage', search: 'flexible funnel auto' },
      ],
    };
  }

  return null; // no vehicle-specific data for this topic
}

// ── Garage HTML renderer ──────────────────────────────────────────────────────

function renderGarage() {
  vehFormOpen = vehFormOpen || garage.length === 0;

  const activeVeh = getActiveVehicle();

  const garageCards = garage.map(v => {
    const isActive = v.id === activeVehId;
    return `
      <div class="garage-card ${isActive ? 'garage-card-active' : ''}" onclick="setActiveVehicle('${v.id}')">
        <div class="gc-avatar">${icons.car}</div>
        <div class="gc-body">
          <div class="gc-name">${escHtml([v.year, v.make, v.model].filter(Boolean).join(' ') || 'Unnamed vehicle')}</div>
          <div class="gc-sub">${escHtml([v.color, v.mileage ? v.mileage + ' mi' : ''].filter(Boolean).join(' · ') || 'No details yet')}</div>
        </div>
        <div class="gc-actions">
          ${isActive ? '<span class="gc-active-badge">Active</span>' : ''}
          <button class="gc-edit-btn" onclick="event.stopPropagation(); editVehicle('${v.id}')">Edit</button>
          <button class="gc-del-btn"  onclick="event.stopPropagation(); deleteVehicle('${v.id}')">Remove</button>
        </div>
      </div>`;
  }).join('');

  const editingVeh = editingVehId ? garage.find(v => v.id === editingVehId) : null;
  const fv = editingVeh || { year:'', make:'', model:'', color:'', vin:'', mileage:'', engine:'', length:'', width:'', height:'', weight:'' };

  const formHtml = vehFormOpen ? `
    <div class="veh-form-panel">
      <div class="veh-form-title">${editingVeh ? 'Edit vehicle' : 'Add a vehicle'}</div>
      <div class="form-grid">
        <div class="section-divider">Basic info</div>
        <div class="form-group"><label>Year</label><input id="v_year"    type="number" min="1900" max="2099" placeholder="e.g. 2019" value="${escHtml(fv.year)}" /></div>
        <div class="form-group"><label>Make</label><input id="v_make"    type="text"   placeholder="e.g. Toyota"  value="${escHtml(fv.make)}" /></div>
        <div class="form-group"><label>Model</label><input id="v_model"  type="text"   placeholder="e.g. Camry"   value="${escHtml(fv.model)}" /></div>
        <div class="form-group"><label>Color</label><input id="v_color"  type="text"   placeholder="e.g. Silver"  value="${escHtml(fv.color)}" /></div>
        <div class="form-group full"><label>VIN</label><input id="v_vin" type="text"   placeholder="17-character VIN" maxlength="17" value="${escHtml(fv.vin)}" class="vin-input" /></div>
        <div class="form-group"><label>Mileage</label><input id="v_mileage" type="text" placeholder="e.g. 42,500" value="${escHtml(fv.mileage)}" /></div>
        <div class="form-group"><label>Engine</label><input id="v_engine"   type="text" placeholder="e.g. 2.5L 4-cyl" value="${escHtml(fv.engine)}" /></div>
        <div class="section-divider">Physical dimensions</div>
        <div class="form-group"><label>Length</label><input id="v_length" type="text" placeholder='e.g. 192"'       value="${escHtml(fv.length)}" /></div>
        <div class="form-group"><label>Width</label> <input id="v_width"  type="text" placeholder='e.g. 72"'        value="${escHtml(fv.width)}" /></div>
        <div class="form-group"><label>Height</label><input id="v_height" type="text" placeholder='e.g. 57"'        value="${escHtml(fv.height)}" /></div>
        <div class="form-group"><label>Curb weight</label><input id="v_weight" type="text" placeholder="e.g. 3,340 lbs" value="${escHtml(fv.weight)}" /></div>
      </div>
      <div class="btn-row">
        <button class="btn-primary" onclick="saveVehicleForm()">${editingVeh ? 'Save changes' : 'Add vehicle'}</button>
        <button class="btn-secondary" onclick="cancelVehForm()">Cancel</button>
      </div>
    </div>` : '';

  return `
    <div class="vehicle-panel">
      <div class="vp-title-row">
        <div class="vp-title">${icons.car} My garage</div>
        <button class="btn-primary" onclick="openAddForm()" style="font-size:12px;padding:6px 14px">+ Add vehicle</button>
      </div>

      ${garage.length === 0 && !vehFormOpen
        ? `<div class="garage-empty">No vehicles yet — add your first one below.</div>`
        : garageCards}

      ${formHtml}

      ${activeVeh ? `
        <div class="active-veh-detail">
          <div class="avd-header">
            <div class="avd-avatar">${icons.car}</div>
            <div>
              <div class="avd-name">${escHtml([activeVeh.year, activeVeh.make, activeVeh.model].filter(Boolean).join(' '))}</div>
              <div class="avd-sub">Active vehicle — maintenance tips will be tailored to this car</div>
            </div>
          </div>
          <div class="info-grid">
            ${activeVeh.vin     ? `<div class="info-item"><div class="ilabel">VIN</div><div class="ival vin-val">${escHtml(activeVeh.vin)}</div></div>` : ''}
            ${activeVeh.engine  ? `<div class="info-item"><div class="ilabel">Engine</div><div class="ival">${escHtml(activeVeh.engine)}</div></div>` : ''}
            ${activeVeh.mileage ? `<div class="info-item"><div class="ilabel">Mileage</div><div class="ival">${escHtml(activeVeh.mileage)} mi</div></div>` : ''}
            ${activeVeh.color   ? `<div class="info-item"><div class="ilabel">Color</div><div class="ival">${escHtml(activeVeh.color)}</div></div>` : ''}
            ${activeVeh.length  ? `<div class="info-item"><div class="ilabel">Length</div><div class="ival">${escHtml(activeVeh.length)}</div></div>` : ''}
            ${activeVeh.width   ? `<div class="info-item"><div class="ilabel">Width</div><div class="ival">${escHtml(activeVeh.width)}</div></div>` : ''}
            ${activeVeh.height  ? `<div class="info-item"><div class="ilabel">Height</div><div class="ival">${escHtml(activeVeh.height)}</div></div>` : ''}
            ${activeVeh.weight  ? `<div class="info-item"><div class="ilabel">Weight</div><div class="ival">${escHtml(activeVeh.weight)}</div></div>` : ''}
          </div>
        </div>` : ''}
    </div>`;
}

// ── Garage actions ────────────────────────────────────────────────────────────

function openAddForm() {
  editingVehId = null;
  vehFormOpen  = true;
  render();
}

function editVehicle(id) {
  editingVehId = id;
  vehFormOpen  = true;
  render();
}

function cancelVehForm() {
  vehFormOpen  = false;
  editingVehId = null;
  render();
}

function saveVehicleForm() {
  const v = {
    id:      editingVehId || ('v' + Date.now()),
    year:    document.getElementById('v_year').value.trim(),
    make:    document.getElementById('v_make').value.trim(),
    model:   document.getElementById('v_model').value.trim(),
    color:   document.getElementById('v_color').value.trim(),
    vin:     document.getElementById('v_vin').value.trim().toUpperCase(),
    mileage: document.getElementById('v_mileage').value.trim(),
    engine:  document.getElementById('v_engine').value.trim(),
    length:  document.getElementById('v_length').value.trim(),
    width:   document.getElementById('v_width').value.trim(),
    height:  document.getElementById('v_height').value.trim(),
    weight:  document.getElementById('v_weight').value.trim(),
  };

  if (editingVehId) {
    const idx = garage.findIndex(x => x.id === editingVehId);
    if (idx >= 0) garage[idx] = v;
  } else {
    garage.push(v);
    activeVehId = v.id;
    vehSaveActive(activeVehId);
  }

  vehSave(garage);
  vehFormOpen  = false;
  editingVehId = null;
  render();
}

function deleteVehicle(id) {
  garage = garage.filter(v => v.id !== id);
  if (activeVehId === id) {
    activeVehId = garage.length ? garage[0].id : null;
    vehSaveActive(activeVehId);
  }
  vehSave(garage);
  render();
}

function setActiveVehicle(id) {
  activeVehId = id;
  vehSaveActive(id);
  render();
}
