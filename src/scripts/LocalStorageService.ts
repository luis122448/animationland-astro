import { Observable, Subject } from "rxjs";
import { scan, startWith } from "rxjs/operators";
import type { ScoreItem } from "../models/ScoreItem.model";

export class LocalStorageService {

    private localStorageKey: string;
    private eventEmitter: Subject<ScoreItem>;
    
    constructor(localStorageKey: string) {
        this.localStorageKey = localStorageKey;
        this.eventEmitter = new Subject<ScoreItem>();
        this.inicializar();
    }

    private inicializar(): void {
        const intervalo = 5000;
    
        // Crear un observable que emita las actualizaciones del evento
        // const puntuacionMaximaObservable = this.eventEmitter.pipe(
        //   scan((acc: number, value: number) => Math.max(acc, value), 0),
        //   startWith(0)
        // );
    
        // Suscribirnos al evento y emitir el valor en el observable
        setInterval(() => {
          const puntuacionMaxima = this.obtenerMaximaPuntuacion();
          this.eventEmitter.next(puntuacionMaxima);
        }, intervalo);
      }    

  // Método para guardar las puntuaciones en el local storage
  public guardarPuntuacion(time: Date, puntuacion: number): void {
    // Obtener las puntuaciones actuales del local storage (si existen)
    const puntuacionesGuardadas: ScoreItem[] = this.obtenerPuntuaciones();

    // Crear Objeto con la nueva puntuación y la fecha
    const nuevaPuntuacion: ScoreItem = {
        id: puntuacionesGuardadas.length + 1,
        time: time.toISOString(),
        score: puntuacion,
        top: 0
    }

    // Agregar la nueva puntuación y la fecha al array de puntuaciones
    puntuacionesGuardadas.push(nuevaPuntuacion);

    // Ordenar las puntuaciones de mayor a menor
    puntuacionesGuardadas.sort((a, b) => b.score - a.score);

    // Asignar el top a cada puntuación usando MAP
    puntuacionesGuardadas.map((puntuacion, index) => {
        puntuacion.top = index + 1;
        return puntuacion;
    })

    // puntuacionesGuardadas.forEach((puntuacion, index) => {
    //     puntuacion.top = index + 1;
    // })      

    // Limitar el registro a un número determinado de puntuaciones (10 mejores)
    const maxPuntuaciones = 10;
    const puntuacionesLimitadas = puntuacionesGuardadas.slice(0, maxPuntuaciones);

    // Guardar el array actualizado en el local storage
    localStorage.setItem(this.localStorageKey, JSON.stringify(puntuacionesLimitadas));
  }

  // Método para obtener las puntuaciones del local storage
  public obtenerPuntuaciones(): ScoreItem[] {
    const scores: string = localStorage.getItem(this.localStorageKey) || '[]';
    const puntuacionesGuardadas: ScoreItem[] = JSON.parse(scores);
    return puntuacionesGuardadas;
  }

  // Método para borrar las puntuaciones del local storage
    public borrarPuntuaciones(): void {
        localStorage.removeItem(this.localStorageKey);
    }

    // Metodo para obtener la maxima puntuacion
    public obtenerMaximaPuntuacion(): ScoreItem {
        const puntuacionesGuardadas: ScoreItem[] = this.obtenerPuntuaciones();
        const noMaxSocre : ScoreItem = { id: 0, time: '', score: 0, top: 0 };
        const maximaPuntuacion: ScoreItem = puntuacionesGuardadas[0] || noMaxSocre
        return maximaPuntuacion;
    }

    public obtenerPuntuacionesObservable(): Observable<ScoreItem> {
        return this.eventEmitter.asObservable();
    }

}