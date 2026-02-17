import { Metadata } from 'next'
import styles from './page.module.css'

export const metadata: Metadata = {
  title: 'BioSafeFood Project | KINT',
  description: 'Development of high quality fruits and vegetables production technology, safe for consumers, with the use of new biopreparations to protect crops against diseases.',
}

export default function BioSafeFoodPage() {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>BioSafeFood Project</h1>
        <p className={styles.subtitle}>
          &quot;Development of high quality fruits and vegetables production technology, safe for consumers, with the use of new biopreparations to protect crops against diseases.&quot;
        </p>
      </div>

      <section className={styles.section}>
        <h2>The Aim of the Project</h2>
        <p>
          The main objective of the project is to develop and introduce into production of fruits and vegetables new, safe biopreparations protecting against the most important diseases, and to develop new technologies for the production of fruits and vegetables with the use of these means.
        </p>
        <p>
          The main elements of the technology will be 3 groups of bioproducts intended for protection:
        </p>
        <ul>
          <li>Berry plants, vegetables and fruit trees against grey mould.</li>
          <li>Apples and pears, among others, against fire blight and apple scab.</li>
          <li>Fruit and vegetables against diseases in the post-harvest period.</li>
        </ul>
        <p className={styles.highlight}>
          Our activities are in line with the current priorities of the European Union to produce fruit without residues of chemical plant protection products and to reduce the risk of environmental pollution.
        </p>
      </section>

      <section className={styles.section}>
        <h2>The Project&apos;s Consortium Members</h2>
        <ul>
          <li>The Institute of Horticulture in Skierniewice (IO)</li>
          <li>Łukasiewicz Research Network – Institute of Industrial Organic Chemistry, Branch Pszczyna</li>
          <li>INTERMAG</li>
        </ul>
      </section>

      <section className={styles.section}>
        <h2>Financing</h2>
        <p>
          The National Centre for Research and Development. Smart Growth Operational Program 2014-2020.
        </p>
      </section>

      <section className={styles.section}>
        <h2>Contact</h2>
        <p>
          PhD Katarzyna Góralska (<a href="mailto:katarzyna.goralaska@intermag.pl">katarzyna.goralaska@intermag.pl</a>)
        </p>
      </section>

      <hr className={styles.divider} />

      <section className={styles.section}>
        <h2>1. Berry Plants, Vegetables and Fruit Trees Against Grey Mould</h2>
        
        <h3>Apples Flowers</h3>
        <p>Flowers on the trees in the greenhouse were sprayed with a suspension of bacteria (10<sup>8</sup> cfu/ml) and then after 24 hours they were infected with a spore suspension of <em>Botrytis cinerea</em> (10<sup>5</sup> cfu/ml).</p>
        
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Treatments</th>
              <th>Infected Flowers (%)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Untreated (water)</td>
              <td>100%</td>
            </tr>
            <tr>
              <td>Our isolate</td>
              <td>5%</td>
            </tr>
          </tbody>
        </table>

        <h3>Grape Fruit</h3>
        <p>The grape fruit were inoculated with the bacterial suspension (10<sup>7</sup> cfu/ml) under laboratory conditions and after 24 hours grapes were infected with a spore suspension of <em>Botrytis cinerea</em> (10<sup>6</sup> cfu/ml).</p>
        
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Treatments</th>
              <th>Efficacy after 7 days (%)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Untreated (water)</td>
              <td>0%</td>
            </tr>
            <tr>
              <td>Our isolate (10<sup>7</sup> cfu/ml)</td>
              <td>65%</td>
            </tr>
          </tbody>
        </table>

        <h3>Efficacy Our Isolate Against Anthracnose on Blueberry Fruit</h3>
        <p>Blueberry fruits were inoculated with bacterial suspension (10<sup>7</sup> cfu/ml) under laboratory conditions and after 24 hours fruits were infected with <em>Colletotrichum</em> sp. suspension (10<sup>6</sup> cfu/ml).</p>
        
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Treatments</th>
              <th>Efficacy after 4 days (%)</th>
              <th>Efficacy after 6 days (%)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Untreated (water)</td>
              <td>0%</td>
              <td>0%</td>
            </tr>
            <tr>
              <td>Our isolate (10<sup>7</sup> cfu/ml)</td>
              <td>75%</td>
              <td>50%</td>
            </tr>
          </tbody>
        </table>
      </section>

      <hr className={styles.divider} />

      <section className={styles.section}>
        <h2>2. Apples and Pears Against Fire Blight and Apple Scab</h2>
        
        <h3>Erwinia amylovora Control – Experiment (Pear Fruit)</h3>
        <p>Under control conditions the pear fruit slices were treated by water suspension of tested isolate. As an active control were used commercial chemical product (copper oxychloride) and biological product (<em>Pantoea agglomerans</em> C9-1).</p>
        <p>After 6 hours the slices were inoculated with <em>E. amylovora</em> (strain Ea 659) by spraying water suspension (10<sup>7</sup> cfu/ml).</p>
        
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Treatments</th>
              <th>Efficacy after 4 days (%)</th>
              <th>Efficacy after 7 days (%)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Untreated (water)</td>
              <td>0%</td>
              <td>0%</td>
            </tr>
            <tr>
              <td>Chemical product (1.5%)</td>
              <td>61.2%</td>
              <td>37.5%</td>
            </tr>
            <tr>
              <td>Our isolate (10<sup>7</sup> cfu/ml)</td>
              <td>74.9%</td>
              <td>49.3%</td>
            </tr>
            <tr>
              <td>Biological product* (10<sup>7</sup> cfu/ml)</td>
              <td>71.1%</td>
              <td>45.0%</td>
            </tr>
          </tbody>
        </table>
        <p className={styles.note}>*<em>Pantoea agglomerans</em> – active ingredient of biological product.</p>

        <h3>Apple Flowers</h3>
        <p>The apple trees in the greenhouse were sprayed with water suspension of the bacterial isolate (10<sup>8</sup> cfu/ml or 10<sup>7</sup> cfu/ml) during full blooming. As an active control were used commercial chemical product (copper oxychloride) and biological product (<em>Pantoea agglomerans</em> C9-1).</p>
        
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Treatments</th>
              <th>Efficacy after 7 days (%)</th>
              <th>Efficacy after 10 days (%)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Untreated (water)</td>
              <td>0%</td>
              <td>0%</td>
            </tr>
            <tr>
              <td>Chemical product (1.5%)</td>
              <td>82.4%</td>
              <td>57.6%</td>
            </tr>
            <tr>
              <td>Our isolate (10<sup>7</sup> cfu/ml)</td>
              <td>92.2%</td>
              <td>88.8%</td>
            </tr>
            <tr>
              <td>Biological product* (10<sup>7</sup> cfu/ml)</td>
              <td>90.8%</td>
              <td>82.9%</td>
            </tr>
          </tbody>
        </table>
        <p className={styles.note}>*<em>Pantoea agglomerans</em> – active ingredient of biological product.</p>

        <h3>Apple Shoots</h3>
        <p>Actively growing shoots were cut off and then were sprayed with water suspension of bacteria (10<sup>7</sup> cfu/ml). As chemical standard was used commercial product (copper oxychloride) and as biological standard was used product with <em>Pantoea agglomerans</em> (C9-1). Inoculation was performed 5 hours after treatment by spraying with water suspension of <em>Erwinia amylovora</em> (strain Ea 659) at concentration 10<sup>7</sup> cfu/ml.</p>
        <p>When the first symptoms on shoots were visible the measurement of the length of necrotized part of shoots was made.</p>
        
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Treatments</th>
              <th>Efficacy after 6 days (%)</th>
              <th>Efficacy after 10 days (%)</th>
              <th>Efficacy after 14 days (%)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Untreated</td>
              <td>0%</td>
              <td>0%</td>
              <td>0%</td>
            </tr>
            <tr>
              <td>Chemical product (1.5%)</td>
              <td>61.7%</td>
              <td>51.7%</td>
              <td>43.8%</td>
            </tr>
            <tr>
              <td>Our isolate (10<sup>7</sup> cfu/ml)</td>
              <td>65.5%</td>
              <td>62.8%</td>
              <td>62.5%</td>
            </tr>
            <tr>
              <td>Biological product* (10<sup>7</sup> cfu/ml)</td>
              <td>60.1%</td>
              <td>55.5%</td>
              <td>58.8%</td>
            </tr>
          </tbody>
        </table>
        <p className={styles.note}>*<em>Pantoea agglomerans</em> – active ingredient of biological product.</p>
      </section>

      <hr className={styles.divider} />

      <section className={styles.section}>
        <h2>3. Fruit and Vegetables Against Diseases in the Post-Harvest Period</h2>
        
        <h3>Protective Properties of Bacteria Against Grey Mould and White Mould on Cabbage</h3>
        <p>Cabbage leaves were soaked in bacterial suspension for 5 minutes. After the dried, the leaves were inoculated with agar plug from 5-day culture of pathogen.</p>
        
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Treatment</th>
              <th>Efficacy after 7 days – <em>Botrytis cinerea</em> (%)</th>
              <th>Efficacy after 7 days – <em>Sclerotinia sclerotiorum</em> (%)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Our isolate 1</td>
              <td>41.2%</td>
              <td>-</td>
            </tr>
            <tr>
              <td>Our isolate 2</td>
              <td>52.0%</td>
              <td>-</td>
            </tr>
            <tr>
              <td>Our isolate 3</td>
              <td>50.0%</td>
              <td>-</td>
            </tr>
            <tr>
              <td>Our isolate 4</td>
              <td>70.6%</td>
              <td>-</td>
            </tr>
            <tr>
              <td>Our isolate 5</td>
              <td>64.6%</td>
              <td>-</td>
            </tr>
            <tr>
              <td>Our isolate 6</td>
              <td>69.0%</td>
              <td>-</td>
            </tr>
            <tr>
              <td>Our isolate 7</td>
              <td>67.0%</td>
              <td>-</td>
            </tr>
            <tr>
              <td>Our isolate 8</td>
              <td>65.2%</td>
              <td>-</td>
            </tr>
            <tr>
              <td>Our isolate 9</td>
              <td>55.6%</td>
              <td>-</td>
            </tr>
            <tr>
              <td>Our isolate 10</td>
              <td>75.2%</td>
              <td>-</td>
            </tr>
            <tr>
              <td>Our isolate 11</td>
              <td>66.3%</td>
              <td>-</td>
            </tr>
            <tr>
              <td>Our isolate 12</td>
              <td>95.5%</td>
              <td>-</td>
            </tr>
            <tr>
              <td>Our isolate 13</td>
              <td>58.7%</td>
              <td>-</td>
            </tr>
            <tr>
              <td>Our isolate 14</td>
              <td>80.7%</td>
              <td>-</td>
            </tr>
            <tr>
              <td>Our isolate 15</td>
              <td>-</td>
              <td>70.0%</td>
            </tr>
            <tr>
              <td>Our isolate 16</td>
              <td>-</td>
              <td>83.2%</td>
            </tr>
            <tr>
              <td>Our isolate 17</td>
              <td>-</td>
              <td>55.7%</td>
            </tr>
            <tr>
              <td>Our isolate 18</td>
              <td>-</td>
              <td>66.9%</td>
            </tr>
            <tr>
              <td>Our isolate 19</td>
              <td>-</td>
              <td>99.2%</td>
            </tr>
            <tr>
              <td>Our isolate 20</td>
              <td>-</td>
              <td>53.7%</td>
            </tr>
          </tbody>
        </table>

        <h3>Protective Properties of Bacteria on Apples</h3>
        <p>In apples fruit were made holes and then a bacterial suspension was added to them or water in the case of a control combination. Apples were infected with a spore suspension of <em>Neofabraea alba</em>, <em>Botrytis cinerea</em>.</p>
        
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Our Isolates</th>
              <th>Efficacy % – <em>Neofabraea alba</em></th>
              <th>Efficacy % – <em>Botrytis cinerea</em></th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Strain A</td>
              <td>86.0%</td>
              <td>100%</td>
            </tr>
            <tr>
              <td>Strain B</td>
              <td>94.0%</td>
              <td>100%</td>
            </tr>
            <tr>
              <td>Strain C</td>
              <td>76.0%</td>
              <td>88.0%</td>
            </tr>
            <tr>
              <td>Strain D</td>
              <td>100%</td>
              <td>97.2%</td>
            </tr>
          </tbody>
        </table>
      </section>
    </div>
  )
}
