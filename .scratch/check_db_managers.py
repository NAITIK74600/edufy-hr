import os
from pymongo import MongoClient

try:
    client = MongoClient('mongodb://127.0.0.1:27017/edufyi_hr?directConnection=true', serverSelectionTimeoutMS=2000)
    db = client.get_default_database()
    emps = list(db.employees.find({'status': {'$ne': 'terminated'}}, {'name': 1, 'role': 1, 'managerId': 1, 'employeeId': 1, 'email': 1}))
    print(f'Total active employees in DB: {len(emps)}')
    no_mgr = [e for e in emps if not e.get('managerId') and e.get('role') != 'admin']
    print(f'Employees without managerId (excluding admin): {len(no_mgr)}')
    for e in no_mgr:
        print(f"  {e.get('employeeId')}: {e.get('name')} ({e.get('role')})")

    # Check managers assigned
    print('\nLeadership hierarchy check:')
    md = db.employees.find_one({'role': 'managing_director'})
    if md:
        print(f"Managing Director: {md.get('name')} ({md.get('employeeId')}), managerId: {md.get('managerId')}")
except Exception as ex:
    print('MongoDB check notice:', ex)

