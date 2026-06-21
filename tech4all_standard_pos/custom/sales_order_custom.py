# import frappe
# def on_submit(self, method):
#     print(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>")
    
#     # Check if taxes_and_charges is provided
#     if self.taxes_and_charges:
#         # Fetch the tax template details using frappe.get_all
#         taxes_template_details = frappe.get_all(
#             "Sales Taxes and Charges",
#             filters={"parent": self.taxes_and_charges},
#             fields=["description", "charge_type", "account_head", "rate"]
#         )
        
#         # Debug: Print the fetched tax template details
#         print(f"Fetched Taxes Template Details: {taxes_template_details}")
        
#         # Ensure taxes_template_details is not empty
#         if taxes_template_details:
#             for tax_detail in taxes_template_details:
#                 # Debug: Print each tax detail being processed
#                 print(f"Processing Tax Detail: {tax_detail}")
                
#                 # Create a new row in the taxes child table
#                 tax_row = self.append("taxes", {})
                
#                 # Update tax row with values from the template
#                 tax_row.update({
#                     "description": tax_detail.get("description").split(" - ")[0] if tax_detail.get("description") else "",
#                     "charge_type": tax_detail.get("charge_type"),
#                     "account_head": tax_detail.get("account_head"),
#                     "rate": tax_detail.get("rate", 0)  # Default to 0 if rate is not provided
#                 })
                
#                 # Debug: Print the updated tax row to check if values were updated
#                 print(f"Updated Tax Row: {tax_row}")

#     # Save the parent document to persist changes
#     self.save()
#     print("Parent document saved successfully.")
