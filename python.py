import pandas as pd

# Load the Excel file
df = pd.read_excel('data1.xlsx', sheet_name='User Data')

# Print the contents of the DataFrame
print(df)
