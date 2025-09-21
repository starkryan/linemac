// Form validation utilities for Aadhaar correction form

export interface FormErrors {
  [key: string]: string | null;
}

export interface FormData {
  // Personal Details
  name: string;
  name_hindi: string;
  gender: string;
  dob: string;
  age: string;
  aadhaar_number: string;
  mobile_number: string;
  email: string;
  npr_receipt: string;

  // Address Details
  co: string;
  co_hindi: string;
  house_no: string;
  house_no_hindi: string;
  street: string;
  street_hindi: string;
  landmark: string;
  landmark_hindi: string;
  area: string;
  area_hindi: string;
  city: string;
  city_hindi: string;
  post_office: string;
  post_office_hindi: string;
  district: string;
  district_hindi: string;
  sub_district: string;
  sub_district_hindi: string;
  state: string;
  state_hindi: string;
  pin_code: string;

  // References
  head_of_family_name: string;
  head_of_family_name_hindi: string;
  relationship: string;
  relationship_hindi: string;
  relative_aadhaar: string;
  relative_contact: string;
  same_address: boolean;

  // Verification Details
  dob_proof_type: string;
  identity_proof_type: string;
  address_proof_type: string;
  por_document_type: string;

  // Appointment Details
  appointment_id: string;
  residential_status: string;
}

export const FormValidation = {
  /**
   * Validate Aadhaar number format
   */
  validateAadhaar(aadhaar: string): string | null {
    if (!aadhaar) return "Aadhaar number is required";

    // Remove spaces and check if it's 12 digits
    const cleanAadhaar = aadhaar.replace(/\s/g, '');
    if (!/^\d{12}$/.test(cleanAadhaar)) {
      return "Aadhaar number must be 12 digits";
    }

    // Basic validation (not Verhoeff algorithm for simplicity)
    return null;
  },

  /**
   * Validate mobile number
   */
  validateMobile(mobile: string): string | null {
    if (!mobile) return "Mobile number is required";

    const cleanMobile = mobile.replace(/\s/g, '');
    if (!/^[6-9]\d{9}$/.test(cleanMobile)) {
      return "Mobile number must be 10 digits starting with 6-9";
    }

    return null;
  },

  /**
   * Validate email
   */
  validateEmail(email: string): string | null {
    if (!email) return null; // Email is optional

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return "Invalid email format";
    }

    return null;
  },

  /**
   * Validate name (minimum 2 characters, letters and spaces only)
   */
  validateName(name: string): string | null {
    if (!name || name.trim().length < 2) {
      return "Name must be at least 2 characters long";
    }

    if (!/^[a-zA-Z\s.]+$/.test(name.trim())) {
      return "Name can only contain letters, spaces, and periods";
    }

    return null;
  },

  /**
   * Validate gender selection
   */
  validateGender(gender: string): string | null {
    if (!gender) return "Please select gender";
    return null;
  },

  /**
   * Validate date of birth
   */
  validateDOB(dob: string): string | null {
    if (!dob) return "Date of birth is required";

    // Validate date format (DD/MM/YYYY or YYYY-MM-DD)
    const dateRegex = /^(\d{2}\/\d{2}\/\d{4}|\d{4}-\d{2}-\d{2})$/;
    if (!dateRegex.test(dob)) {
      return "Invalid date format. Use DD/MM/YYYY or YYYY-MM-DD";
    }

    // Check if date is not in the future
    const date = new Date(dob.includes('/') ? dob.split('/').reverse().join('-') : dob);
    if (isNaN(date.getTime())) {
      return "Invalid date";
    }

    if (date > new Date()) {
      return "Date of birth cannot be in the future";
    }

    // Check if person is at least 1 year old
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    if (date > oneYearAgo) {
      return "Age must be at least 1 year";
    }

    return null;
  },

  /**
   * Validate PIN code
   */
  validatePinCode(pinCode: string): string | null {
    if (!pinCode) return "PIN code is required";

    if (!/^\d{6}$/.test(pinCode)) {
      return "PIN code must be 6 digits";
    }

    return null;
  },

  /**
   * Validate required fields
   */
  validateRequired(value: string, fieldName: string): string | null {
    if (!value || value.trim().length === 0) {
      return `${fieldName} is required`;
    }
    return null;
  },

  /**
   * Validate entire form
   */
  validateForm(formData: Partial<FormData>): FormErrors {
    const errors: FormErrors = {};

    // Validate basic demographics
    errors.aadhaar_number = this.validateAadhaar(formData.aadhaar_number || '');
    errors.mobile_number = this.validateMobile(formData.mobile_number || '');
    errors.name = this.validateName(formData.name || '');
    errors.gender = this.validateGender(formData.gender || '');
    errors.dob = this.validateDOB(formData.dob || '');
    errors.email = this.validateEmail(formData.email || '');
    errors.pin_code = this.validatePinCode(formData.pin_code || '');

    // Validate address fields
    errors.city = this.validateRequired(formData.city || '', 'City');
    errors.district = this.validateRequired(formData.district || '', 'District');
    errors.state = this.validateRequired(formData.state || '', 'State');

    // Validate relative details
    errors.head_of_family_name = this.validateRequired(formData.head_of_family_name || '', 'Head of family name');
    errors.relationship = this.validateRequired(formData.relationship || '', 'Relationship');

    // Validate verification details (only if verification method is documents)
    if (formData.dob_proof_type) {
      errors.dob_proof_type = this.validateRequired(formData.dob_proof_type, 'Date of Birth proof type');
    }
    if (formData.identity_proof_type) {
      errors.identity_proof_type = this.validateRequired(formData.identity_proof_type, 'Identity proof type');
    }
    if (formData.address_proof_type) {
      errors.address_proof_type = this.validateRequired(formData.address_proof_type, 'Address proof type');
    }

    // Remove null errors
    Object.keys(errors).forEach(key => {
      if (errors[key] === null) {
        delete errors[key];
      }
    });

    return errors;
  },

  /**
   * Check if form has any validation errors
   */
  hasErrors(errors: FormErrors): boolean {
    return Object.keys(errors).length > 0;
  },

  /**
   * Get first error message
   */
  getFirstError(errors: FormErrors): string | null {
    const errorKeys = Object.keys(errors);
    return errorKeys.length > 0 ? errors[errorKeys[0]] : null;
  },

  /**
   * Format error message for display
   */
  formatError(field: string, error: string): string {
    const fieldNames: { [key: string]: string } = {
      aadhaar_number: 'Aadhaar Number',
      mobile_number: 'Mobile Number',
      name: 'Name',
      gender: 'Gender',
      dob: 'Date of Birth',
      email: 'Email',
      city: 'City',
      district: 'District',
      state: 'State',
      pin_code: 'PIN Code',
      head_of_family_name: 'Head of Family Name',
      relationship: 'Relationship',
      dob_proof_type: 'Date of Birth Proof',
      identity_proof_type: 'Identity Proof',
      address_proof_type: 'Address Proof',
      por_document_type: 'POR Document',
    };

    const fieldName = fieldNames[field] || field.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    return `${fieldName}: ${error}`;
  },
};