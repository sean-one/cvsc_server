export const emailformat = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
// ensures that the Instagram username consists of valid characters and meets length requirements
// optional @ symbol at the front
export const instagramFormat = /^@?[a-zA-Z0-9._]{1,30}$/

// allowing for optional "http" and "www" prefixes while accounting for valid TLDs
export const websiteFormat = /^(?:(?:https?:\/\/)?(?:www\.)?)?[\w-]+(\.[\w-]+)+[\w.,@?^=%&:/~+#-]*$/

// allows for alphanumeric characters, dots, underscores, and hyphens
// min of 5 characters for the username.
export const facebookFormat = /^[a-zA-Z0-9._-]{5,}$/

// allows phone numbers, including variations with or without parentheses, dashes, dots, or spaces
// validates 10-digit U.S. phone numbers.
export const phoneFormat = /^(?:\(\d{3}\)|\d{3})[-.]?\d{3}[-.]?\d{4}$/

// allows for alphanumeric characters and underscores. min of 1 character, max of 15 characters for the username.
// optional @ symbol at the front
export const twitterFormat = /^@?[a-zA-Z0-9_]{1,15}$/


export const streetAddressFormat = /^[a-zA-Z0-9\s\-.,#&]*$/;
export const cityFormat = /^[a-zA-Z\s.'-]+(?:,\s*[a-zA-Z\s.'-]+)*$/;
export const stateList = /^(?:AL|AK|AZ|AR|CA|CO|CT|DE|FL|GA|HI|ID|IL|IN|IA|KS|KY|LA|ME|MD|MA|MI|MN|MS|MO|MT|NE|NV|NH|NJ|NM|NY|NC|ND|OH|OK|OR|PA|RI|SC|SD|TN|TX|UT|VT|VA|WA|WV|WI|WY)$/i
// validate a 5-digit ZIP code format commonly used in the United States
// optional include a hyphen and four additional digits
export const zipFormat = /^\d{5}(?:-\d{4})?$/;

export const businessTypeList = /^(?:BRAND|VENUE|BOTH)$/i;

export const username_alphanumeric = /^[a-zA-Z0-9*@_.\-!$]+$/;
export const username_repeatingspecial = /^(?!.*([*@_.\-!$])\1)[a-zA-Z0-9*@_.\-!$]+$/;

// if (!alphanumeric.test(value)) {
//     return 'can only contain alphanumeric, *, _, -, ., $, !, and @';
// }

// const passwordneeds = /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[!@#$%^&*()_+-=,./?;:'"[\]{}|\\]).{8,}$/;

// if(value.length < 8) {
//     return 'password must be at least 8 characters'
// }

// if(value.length >= 49) {
//     return 'password is too long'
// }

// if(!passwordneeds.test(value)) {
//     return 'password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
// }