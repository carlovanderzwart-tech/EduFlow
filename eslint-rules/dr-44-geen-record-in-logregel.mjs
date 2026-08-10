/**
 * DR-44 — geef nooit een `Documentation`, `Student`, `Page`, `Block`,
 * `MailMessage` of `MailDraft` als geheel aan een logfunctie.
 *
 * Dit is de eerste van de elf poorten uit §16.9 en hij kon pas werken toen de
 * domeintypen bestonden: vier van de zes typen bestonden niet, en de regel kijkt
 * naar het **type** van het argument, niet naar de naam van de variabele. Een
 * regel op namen zou `console.log(d)` doorlaten en `console.log(documentation)`
 * tegenhouden, en dat is precies andersom als wat ertoe doet.
 *
 * Waarom de regel bestaat: elk van de zes typen draagt persoonsgegevens. Een
 * logregel is de makkelijkste manier om die per ongeluk buiten de app te krijgen
 * — in een consolelog dat iemand kopieert, in een foutrapport, in een
 * schermafdruk bij een supportvraag. §16.4 zegt wat er nooit in een logboek komt;
 * deze regel maakt dat afdwingbaar in plaats van hoopvol.
 *
 * De vier blokvarianten staan erbij omdat `Block` in `domain/types/page.ts` een
 * unie van die vier is. Zonder hen zou `console.log(textBlock)` erdoor glippen
 * terwijl `console.log(block)` wordt tegengehouden, en dat is dezelfde regel met
 * een gat erin.
 */

const VERBODEN_TYPEN = new Set([
  "Documentation",
  "Student",
  "Page",
  "Block",
  "TextBlock",
  "PhotoBlock",
  "QuoteBlock",
  "HeadingBlock",
  "MailMessage",
  "MailDraft",
]);

/** De functienamen die als logfunctie tellen. */
const LOGFUNCTIES = new Set(["log", "info", "warn", "error", "debug", "trace"]);

function isLogAanroep(node) {
  const doelwit = node.callee;
  if (doelwit.type === "Identifier") return LOGFUNCTIES.has(doelwit.name);
  if (
    doelwit.type === "MemberExpression" &&
    !doelwit.computed &&
    doelwit.property.type === "Identifier"
  ) {
    return LOGFUNCTIES.has(doelwit.property.name);
  }
  return false;
}

/**
 * Verzamelt de namen waaronder een type bekend staat.
 *
 * Een type kan onder meer dan één naam bekend zijn: `Block` is een alias voor een
 * unie, en elke tak van die unie heeft zijn eigen naam. Een lijst van
 * documentaties is een `Array` met een typeargument. Alle drie de gevallen
 * moeten geraakt worden, want ze dragen dezelfde persoonsgegevens.
 */
function typenamenVan(type, gezien = new Set()) {
  const namen = new Set();
  if (!type || gezien.has(type)) return namen;
  gezien.add(type);

  if (type.aliasSymbol) namen.add(type.aliasSymbol.getName());
  const teken = type.getSymbol?.();
  if (teken) namen.add(teken.getName());

  const takken = type.types ?? [];
  for (const tak of takken) {
    for (const naam of typenamenVan(tak, gezien)) namen.add(naam);
  }

  // Een `Documentation[]` draagt evenveel persoonsgegevens als één record.
  for (const argument of type.typeArguments ?? []) {
    for (const naam of typenamenVan(argument, gezien)) namen.add(naam);
  }

  return namen;
}

/** @type {import("eslint").Rule.RuleModule} */
export const dr44GeenRecordInLogregel = {
  meta: {
    type: "problem",
    docs: {
      description:
        "DR-44: een Documentation, Student, Page, Block, MailMessage of MailDraft gaat nooit als geheel naar een logfunctie.",
    },
    schema: [],
    messages: {
      verboden:
        "DR-44: geef geen {{typenaam}} als geheel aan een logfunctie. Log een sleutel of een telling, nooit het record (§16.4).",
    },
  },

  create(context) {
    const diensten = context.sourceCode.parserServices;
    // Zonder typeinformatie kan deze regel niets zinnigs zeggen. Stil overslaan
    // is dan eerlijker dan raden op variabelenamen.
    if (!diensten?.program || !diensten.esTreeNodeToTSNodeMap) return {};

    const controleur = diensten.program.getTypeChecker();

    return {
      CallExpression(node) {
        if (!isLogAanroep(node)) return;

        for (const argument of node.arguments) {
          const tsKnoop = diensten.esTreeNodeToTSNodeMap.get(argument);
          if (!tsKnoop) continue;

          const namen = typenamenVan(controleur.getTypeAtLocation(tsKnoop));
          const treffer = [...namen].find((naam) => VERBODEN_TYPEN.has(naam));
          if (treffer) {
            context.report({ node: argument, messageId: "verboden", data: { typenaam: treffer } });
          }
        }
      },
    };
  },
};

const eduflowRegels = {
  rules: { "dr-44-geen-record-in-logregel": dr44GeenRecordInLogregel },
};

export default eduflowRegels;
