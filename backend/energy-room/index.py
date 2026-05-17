import json
import os
from datetime import date, timedelta
import psycopg2

def handler(event: dict, context) -> dict:
    """История потребления энергии по конкретной комнате за последние 30 дней"""
    cors = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
    }

    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': cors, 'body': ''}

    params = event.get('queryStringParameters') or {}
    user_id = int(params.get('user_id', 1))
    room_id = params.get('room_id')
    days = int(params.get('days', 30))

    conn = psycopg2.connect(os.environ['DATABASE_URL'])
    cur = conn.cursor()

    today = date.today()
    start = today - timedelta(days=days - 1)

    if room_id:
        # История по конкретной комнате
        cur.execute("""
            SELECT date, consumption_kwh, peak_load
            FROM energy_data
            WHERE user_id = %s AND room_id = %s AND date >= %s AND date <= %s
            ORDER BY date
        """, (user_id, int(room_id), start, today))
        rows = cur.fetchall()
        history = [
            {'date': str(r[0]), 'consumption_kwh': float(r[1]), 'peak_load': float(r[2])}
            for r in rows
        ]

        # Статистика
        total = sum(r['consumption_kwh'] for r in history)
        avg = round(total / len(history), 2) if history else 0
        peak = max((r['consumption_kwh'] for r in history), default=0)

        cur.close()
        conn.close()
        return {
            'statusCode': 200,
            'headers': cors,
            'body': json.dumps({
                'history': history,
                'stats': {
                    'total_kwh': round(total, 2),
                    'avg_kwh': avg,
                    'peak_kwh': round(peak, 2),
                    'cost': round(total * 4, 0),
                    'days_count': len(history),
                }
            })
        }
    else:
        # Сравнение всех комнат за период
        cur.execute("""
            SELECT room_id, SUM(consumption_kwh) as total
            FROM energy_data
            WHERE user_id = %s AND date >= %s AND date <= %s
            GROUP BY room_id ORDER BY total DESC
        """, (user_id, start, today))
        rows = cur.fetchall()
        result = [{'room_id': r[0], 'total_kwh': float(r[1])} for r in rows]
        cur.close()
        conn.close()
        return {'statusCode': 200, 'headers': cors, 'body': json.dumps(result)}
