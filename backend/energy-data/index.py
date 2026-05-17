import json
import os
from datetime import date, timedelta
import psycopg2

def handler(event: dict, context) -> dict:
    """Запись и чтение данных потребления энергии по комнатам"""
    cors = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
    }

    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': cors, 'body': ''}

    conn = psycopg2.connect(os.environ['DATABASE_URL'])
    cur = conn.cursor()

    method = event.get('httpMethod', 'GET')

    if method == 'POST':
        body = json.loads(event.get('body') or '{}')
        user_id = body.get('user_id', 1)
        room_id = body.get('room_id')
        record_date = body.get('date', str(date.today()))
        consumption_kwh = body.get('consumption_kwh', 0)
        peak_load = body.get('peak_load', 0)

        cur.execute("""
            INSERT INTO energy_data (user_id, room_id, date, consumption_kwh, peak_load)
            VALUES (%s, %s, %s, %s, %s)
            ON CONFLICT (user_id, room_id, date)
            DO UPDATE SET consumption_kwh = EXCLUDED.consumption_kwh, peak_load = EXCLUDED.peak_load
        """, (user_id, room_id, record_date, consumption_kwh, peak_load))
        conn.commit()
        cur.close()
        conn.close()
        return {'statusCode': 200, 'headers': cors, 'body': json.dumps({'ok': True})}

    # GET — агрегируем данные для графиков
    params = event.get('queryStringParameters') or {}
    user_id = params.get('user_id', 1)
    mode = params.get('mode', 'week')  # week | month

    if mode == 'week':
        today = date.today()
        start = today - timedelta(days=6)
        cur.execute("""
            SELECT date, SUM(consumption_kwh) as total
            FROM energy_data
            WHERE user_id = %s AND date >= %s AND date <= %s
            GROUP BY date ORDER BY date
        """, (user_id, start, today))
        rows = cur.fetchall()
        days_ru = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']
        data_map = {r[0]: float(r[1]) for r in rows}
        result = []
        for i in range(7):
            d = start + timedelta(days=i)
            result.append({'day': days_ru[d.weekday()], 'consumption': data_map.get(d, 0)})
    else:
        cur.execute("""
            SELECT DATE_TRUNC('month', date) as month, SUM(consumption_kwh) as total
            FROM energy_data
            WHERE user_id = %s AND date >= NOW() - INTERVAL '6 months'
            GROUP BY 1 ORDER BY 1
        """, (user_id,))
        rows = cur.fetchall()
        months_ru = ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек']
        result = [
            {'month': months_ru[r[0].month - 1], 'consumption': float(r[1]), 'cost': round(float(r[1]) * 4, 0)}
            for r in rows
        ]

    cur.close()
    conn.close()
    return {'statusCode': 200, 'headers': cors, 'body': json.dumps(result)}
