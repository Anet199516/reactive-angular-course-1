import {Injectable} from "@angular/core";
import {BehaviorSubject, Observable, throwError} from "rxjs";
import {Course, sortCoursesBySeqNo} from "../model/course";
import {catchError, map, shareReplay, tap} from "rxjs/operators";
import {HttpClient} from "@angular/common/http";
import {LoadingService} from "../loading/loading.service";
import {MessagesService} from "../messages/messages.service";

@Injectable({
  providedIn: 'root'
})
export class CoursesStore {
    private subject$ = new BehaviorSubject<Course[]>([])

    courses$: Observable<Course[]> = this.subject$.asObservable();

    constructor(private http: HttpClient,
                private loading: LoadingService,
                private messages: MessagesService) {

      this.loadAllCourses();
    }

  private loadAllCourses() {
    const loadCourses$ = this.http.get<Course[]>('/api/courses').pipe(
      map(res => res['payload']),
      catchError(err => {
        const message = 'Could not load courses';

        this.messages.showErrors(message);
        console.log(message, err);
        return throwError(err);
      }),
      tap(courses => this.subject$.next(courses))
    );

    // without subscribe nothing happens
    this.loading.showLoaderUntilCompleted(loadCourses$).subscribe();
  }

  saveCourse(courseId: string, changes: Partial<Course>): Observable<any> {

      // get the latest data - list of courses
      const courses = this.subject$.getValue();

      const index = courses.findIndex(course => course.id === courseId);

      const newCourse = {
        ...courses[index],
        ...changes
      };

      const newCourses: Course[] = courses.slice(0);

      newCourses[index] = newCourse;

      this.subject$.next(newCourses);

      return this.http.put(`/api/courses/${courseId}`, changes).pipe(
        catchError(err => {
          const message = 'Could not load courses';

          this.messages.showErrors(message);
          console.log(message, err);
          return throwError(err);
        }),
        shareReplay()
      );
  }

    filterByCategory(category: string): Observable<Course[]> {
      return this.courses$.pipe(
        map(courses =>
          courses.filter(course => course.category === category)
            .sort(sortCoursesBySeqNo)
        )
      )
    }
}
