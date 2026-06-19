import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ReferenceLine, ReferenceArea,
} from 'recharts';
import { STANDARD_REF } from '../../data/mockData';

const axis = { fontSize: 11, fontFamily: 'var(--font-mono)', fill: '#5A6571' };

export default function PhTrendChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={data} margin={{ top: 8, right: 16, bottom: 8, left: 0 }}>
        <CartesianGrid stroke="#E4E9EE" vertical={false} />
        <XAxis dataKey="time" tick={axis} stroke="#AEB7C0"
          label={{ value: 'Waktu (WITA)', position: 'insideBottom', offset: -2, fontSize: 11, fill: '#98A2AE' }} />
        <YAxis domain={[0, 14]} ticks={[0, 3, 6, 9, 12, 14]} tick={axis} stroke="#AEB7C0"
          label={{ value: 'pH', angle: -90, position: 'insideLeft', fontSize: 11, fill: '#98A2AE' }} />

        {/* Warning band 5.5 – 6.0 */}
        <ReferenceArea y1={5.5} y2={6.0} fill="#BF8700" fillOpacity={0.12} />

        {/* Baku mutu lines */}
        <ReferenceLine y={6} stroke="#D1242F" strokeDasharray="5 4"
          label={{ value: `Batas bawah 6.0 · ${STANDARD_REF}`, position: 'insideTopRight', fontSize: 10, fill: '#D1242F' }} />
        <ReferenceLine y={9} stroke="#D1242F" strokeDasharray="5 4"
          label={{ value: 'Batas atas 9.0', position: 'insideBottomRight', fontSize: 10, fill: '#D1242F' }} />

        <Tooltip
          contentStyle={{ background: '#fff', border: '1px solid #D6DCE2', borderRadius: 4, fontFamily: 'var(--font-mono)', fontSize: 12 }}
          labelStyle={{ color: '#5A6571' }}
          formatter={(v) => [`pH ${v}`, 'Nilai']}
        />
        <Line type="monotone" dataKey="pH" stroke="#161B22" strokeWidth={2}
          dot={{ r: 2.5, fill: '#161B22' }} activeDot={{ r: 4 }} isAnimationActive={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}
