const ShopSettings = require('../models/ShopSettings');
const ApiResponse = require('../utils/apiResponse');

/**
 * Get Shop Settings
 */
exports.getSettings = async (req, res, next) => {
  try {
    let settings = await ShopSettings.findOne();

    // Auto initialize with defaults if empty
    if (!settings) {
      settings = await ShopSettings.create({
        shopName: 'COMPUTER BAZAAR',
        tagline: 'Computer, Laptop, CCTV & Networking Solutions',
        phone: '+91 98765 43210',
        email: 'contact@dreamonixsolution.com',
        companyName: 'Dreamonix Solution',
        website: 'https://dreamonixsolution.com/',
        address: '104 Computer Plaza, Commercial Hub',
        city: 'Metro City',
        state: 'State',
        pincode: '751001',
        gstNumber: '',
        invoicePrefix: 'INV',
        repairPrefix: 'REP',
        defaultGstRate: 18,
        currencySymbol: '₹',
        themeColor: '#2563eb'
      });
    } else if (settings.shopName && (/pc doctor/i.test(settings.shopName) || /pcdoctor/i.test(settings.email || ''))) {
      // Auto-migrate legacy branding in database safely
      if (/pc doctor/i.test(settings.shopName)) {
        settings.shopName = 'COMPUTER BAZAAR';
      }
      if (settings.email && /pcdoctor/i.test(settings.email)) {
        settings.email = 'contact@dreamonixsolution.com';
      }
      if (!settings.companyName || /pc doctor/i.test(settings.companyName)) {
        settings.companyName = 'Dreamonix Solution';
      }
      if (!settings.website || /pcdoctor/i.test(settings.website)) {
        settings.website = 'https://dreamonixsolution.com/';
      }
      await settings.save();
    }

    return ApiResponse.success(res, settings, 'Shop settings retrieved');
  } catch (error) {
    next(error);
  }
};

/**
 * Update Shop Settings
 */
exports.updateSettings = async (req, res, next) => {
  try {
    let settings = await ShopSettings.findOne();

    if (!settings) {
      settings = new ShopSettings();
    }

    const {
      shopName,
      tagline,
      logo,
      phone,
      alternatePhone,
      email,
      address,
      city,
      state,
      pincode,
      gstNumber,
      invoicePrefix,
      repairPrefix,
      invoiceFooter,
      termsAndConditions,
      currencySymbol,
      themeColor,
      upiId,
      defaultGstRate,
      website,
      companyName
    } = req.body;

    if (shopName) settings.shopName = shopName;
    if (companyName !== undefined) settings.companyName = companyName;
    if (website !== undefined) settings.website = website;
    if (tagline !== undefined) settings.tagline = tagline;
    if (logo !== undefined) settings.logo = logo;
    if (phone) settings.phone = phone;
    if (alternatePhone !== undefined) settings.alternatePhone = alternatePhone;
    if (email !== undefined) settings.email = email;
    if (address !== undefined) settings.address = address;
    if (city !== undefined) settings.city = city;
    if (state !== undefined) settings.state = state;
    if (pincode !== undefined) settings.pincode = pincode;
    if (gstNumber !== undefined) settings.gstNumber = gstNumber;
    if (invoicePrefix !== undefined) settings.invoicePrefix = invoicePrefix.toUpperCase();
    if (repairPrefix !== undefined) settings.repairPrefix = repairPrefix.toUpperCase();
    if (invoiceFooter !== undefined) settings.invoiceFooter = invoiceFooter;
    if (termsAndConditions !== undefined) settings.termsAndConditions = termsAndConditions;
    if (currencySymbol !== undefined) settings.currencySymbol = currencySymbol;
    if (themeColor !== undefined) settings.themeColor = themeColor;
    if (upiId !== undefined) settings.upiId = upiId;
    if (defaultGstRate !== undefined) settings.defaultGstRate = Number(defaultGstRate);

    await settings.save();
    return ApiResponse.success(res, settings, 'Shop settings updated successfully');
  } catch (error) {
    next(error);
  }
};
