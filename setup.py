from setuptools import setup, find_packages

with open("requirements.txt") as f:
	install_requires = f.read().strip().split("\n")

# get version from __version__ variable in tech4all_standard_pos/__init__.py
from tech4all_standard_pos import __version__ as version

setup(
	name="tech4all_standard_pos",
	version=version,
	description="Tech4All Standard POS",
	author="Usman Younas",
	author_email="erpnext@Tech4All.com",
	packages=find_packages(),
	zip_safe=False,
	include_package_data=True,
	install_requires=install_requires
)
