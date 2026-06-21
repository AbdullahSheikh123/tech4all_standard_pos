import { ref, onMounted } from 'vue';

export default function useFormat() {
  const float_precision = ref(2);
  const currency_precision = ref(2);

  const flt = (value, precision, number_format, rounding_method) => {
    if (!precision && precision != 0) {
      precision = currency_precision.value || 2;
    }
    if (!rounding_method) {
      rounding_method = "Banker's Rounding (legacy)";
    }
    return flt(value, precision, number_format, rounding_method);
  };

  const formtCurrency = (value, precision) => {
    const format = get_number_format(pos_profile.value?.currency);
    value = format_number(
      value,
      format,
      precision || currency_precision.value || 2
    );
    return value;
  };

  const formtFloat = (value, precision) => {
    const format = get_number_format(pos_profile.value?.currency);
    value = format_number(value, format, precision || float_precision.value || 2);
    return value;
  };

  const setFormatedCurrency = (el, field_name, precision, no_negative = false, $event) => {
    let value = 0;
    try {
      let _value = parseFloat($event);
      if (!isNaN(_value)) {
        value = _value;
      }
      if (no_negative && value < 0) {
        value = value * -1;
      }
      value = formtCurrency($event, precision);
    } catch (e) {
      console.error(e);
      value = 0;
    }

    if (typeof el === "object") {
      el[field_name] = value;
    } else {
      el[field_name] = value;
    }

    return value;
  };

  const setFormatedFloat = (el, field_name, precision, no_negative = false, $event) => {
    let value = 0;
    try {
      value = parseFloat($event);
      if (isNaN(value)) {
        value = 0;
      } else if (no_negative && value < 0) {
        value = value * -1;
      }
      value = formtFloat($event, precision);
    } catch (e) {
      console.error(e);
      value = 0;
    }

    if (typeof el === "object") {
      el[field_name] = value;
    } else {
      el[field_name] = value;
    }

    return value;
  };

  const currencySymbol = (currency) => {
    return get_currency_symbol(currency);
  };

  const isNumber = (value) => {
    const pattern = /^-?(\d+|\d{1,3}(\.\d{3})*)(,\d+)?$/;
    return pattern.test(value) || "invalid number";
  };

  onMounted(() => {
    float_precision.value = frappe.defaults.get_default('float_precision') || 2;
    currency_precision.value = frappe.defaults.get_default('currency_precision') || 2;
  });

  return {
    float_precision,
    currency_precision,
    flt,
    formtCurrency,
    formtFloat,
    setFormatedCurrency,
    setFormatedFloat,
    currencySymbol,
    isNumber,
  };
}
