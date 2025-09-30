import json
import os
import urllib.request
import urllib.error

BASE_USERS = os.environ.get('USERS_URL', 'http://localhost:8001')
BASE_GATE = os.environ.get('GATEWAY_URL', 'http://localhost:8080')


def post(url: str, payload: dict):
	data = json.dumps(payload).encode('utf-8')
	req = urllib.request.Request(url, data=data, headers={'Content-Type': 'application/json'})
	with urllib.request.urlopen(req, timeout=10) as r:
		return json.loads(r.read().decode('utf-8'))


def get(url: str):
	with urllib.request.urlopen(url, timeout=10) as r:
		return json.loads(r.read().decode('utf-8'))


def main():
	out = {}
	try:
		out['gateway_health'] = get(f"{BASE_GATE}/")
	except Exception as e:
		out['gateway_health_error'] = str(e)

	uid = None
	try:
		signup = post(f"{BASE_USERS}/signup", {
			'name': 'Demo',
			'age': 25,
			'dob': '2000-01-01',
			'email': 'demo@example.com',
			'password': 'pass',
			'risk_profile': 'moderate',
		})
		out['signup'] = {'id': signup.get('id'), 'email': signup.get('email')}
		uid = signup.get('id')
	except urllib.error.HTTPError as he:
		out['signup_error'] = f"HTTP {he.code}: {he.read().decode('utf-8', 'ignore')}"
	except Exception as e:
		out['signup_error'] = str(e)

	# direct users login
	try:
		ulogin = post(f"{BASE_USERS}/login", {
			'email': 'demo@example.com',
			'password': 'pass',
		})
		out['users_login'] = {'id': ulogin.get('id'), 'email': ulogin.get('email')}
		uid = uid or ulogin.get('id')
	except urllib.error.HTTPError as he:
		out['users_login_error'] = f"HTTP {he.code}: {he.read().decode('utf-8', 'ignore')}"
	except Exception as e:
		out['users_login_error'] = str(e)

	# gateway login
	try:
		login = post(f"{BASE_GATE}/api/users/login", {
			'email': 'demo@example.com',
			'password': 'pass',
		})
		out['gateway_login'] = {'id': login.get('id'), 'email': login.get('email')}
		uid = uid or login.get('id')
	except urllib.error.HTTPError as he:
		out['gateway_login_error'] = f"HTTP {he.code}: {he.read().decode('utf-8', 'ignore')}"
	except Exception as e:
		out['gateway_login_error'] = str(e)

	if uid:
		try:
			out['portfolio'] = get(f"{BASE_GATE}/api/portfolio/{uid}")
		except urllib.error.HTTPError as he:
			out['portfolio_error'] = f"HTTP {he.code}: {he.read().decode('utf-8', 'ignore')}"
		except Exception as e:
			out['portfolio_error'] = str(e)
		try:
			out['goals'] = get(f"{BASE_GATE}/api/goals/{uid}")
		except urllib.error.HTTPError as he:
			out['goals_error'] = f"HTTP {he.code}: {he.read().decode('utf-8', 'ignore')}"
		except Exception as e:
			out['goals_error'] = str(e)
		try:
			out['ai_predict'] = post(f"{BASE_GATE}/api/ai/predict", {'user_id': uid})
		except urllib.error.HTTPError as he:
			out['ai_predict_error'] = f"HTTP {he.code}: {he.read().decode('utf-8', 'ignore')}"
		except Exception as e:
			out['ai_predict_error'] = str(e)

	print(json.dumps(out))


if __name__ == '__main__':
	main()
