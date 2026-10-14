// Registre des cours : chaque dossier src/courses/<id>/ avec un fichier course.js est ajouté automatiquement.
const mods = import.meta.glob('./*/course.js', { eager: true });
export const COURSES = Object.values(mods).map(m => m.default).sort((a, b) => a.title.localeCompare(b.title, 'fr'));
export const byId = id => COURSES.find(c => c.id === id);

const cache = {};
/** Charge (une seule fois) le contenu d'un cours et y ajoute quelques comptes utiles. */
export async function loadCourse(c) {
  if (!cache[c.id]) {
    cache[c.id] = c.load().then(d => {
      const base = import.meta.env.BASE_URL + 'courses/' + c.id + '/';
      const exams = (d.exams || []).map(e => ({
        ...e,
        head: (e.head || '').replaceAll('src="img/', `src="${base}img/`),
        exos: e.exos.map(x => ({ ...x, intro: (x.intro || '').replaceAll('src="img/', `src="${base}img/`), qs: x.qs.map(q => ({ ...q, q: q.q.replaceAll('src="img/', `src="${base}img/`) })) })),
      }));
      const lessons = (d.lessons || []).map(l => ({ ...l, sections: l.sections.map(s => ({ ...s, html: s.html.replaceAll('src="img/', `src="${base}img/`) })) }));
      const examQ = exams.reduce((s, e) => s + e.exos.reduce((t, x) => t + x.qs.length, 0), 0);
      return { ...d, exams, lessons: d.lessons ? lessons : undefined, counts: { cards: (d.cards || []).length, quiz: (d.quiz || []).length, fiches: Object.keys(d.fiches || {}).length, examQ } };
    });
  }
  return cache[c.id];
}
